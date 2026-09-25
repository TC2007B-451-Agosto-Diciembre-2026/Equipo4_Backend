import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Reporte } from './entities/reporte.entity';

const COLUMNS =
  'id, nombre, descripcion, longitud, latitud, foto, usuario_id, ' +
  'fuente_id, estado_id, tipo_propiedad_id, tipo_fraude_id, ' +
  'created_at, updated_at, deleted_at';

/**
 * Forma de un reporte nuevo antes de insertarse.
 * `estadoId` no se recibe al crear: todo reporte nuevo nace en
 * "Pendiente" (ver {@link ReportesRepository.save}).
 */
type NuevoReporte = Omit<
  Reporte,
  "id" | "createdAt" | "updatedAt" | "deletedAt" | "estadoId"
>;

/**
 * errno de MySQL cuando el subquery que busca el estado "Pendiente"
 * no encuentra nada y `estado_id` (NOT NULL) recibe NULL.
 */
const ESTADO_INICIAL_INEXISTENTE_ERRNO = 1048;

/** Cambios parciales aceptados por `update`. `usuarioId` no es editable (el dueño de un reporte no cambia). */
type CambiosReporte = Partial<
  Omit<Reporte, "id" | "usuarioId" | "createdAt" | "updatedAt" | "deletedAt">
>;

/** errno de MySQL para violación de FK (`reporte` → `fuente`/`estado`/`tipo_propiedad`/`tipo_fraude`/`usuario`). */
const FK_ERRNO = 1452;
/**
 * errno de MySQL para intento de borrar una fila de catálogo que
 * todavía está referenciada. No aplica directamente en este
 * repositorio (aquí no se borran catálogos), se deja documentado
 * por consistencia con los repositorios de catálogo.
 */
const REFERENCED_ERRNO = 1451;

/**
 * Acceso a datos de `reporte`, la entidad central del sistema.
 * Todas las queries son parametrizadas. Aplica borrado lógico: toda
 * lectura filtra `deleted_at IS NULL`.
 */
@Injectable()
export class ReportesRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  /** Lista todos los reportes activos, más recientes primero. */
  async findAll(): Promise<Reporte[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM reporte WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    );
    return rows.map(toEntity);
  }

  /** Lista los reportes activos de un usuario específico (UUID), más recientes primero. */
  async findByUsuario(usuarioId: string): Promise<Reporte[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM reporte
       WHERE usuario_id = ? AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [usuarioId],
    );
    return rows.map(toEntity);
  }

  /** Busca un reporte activo por id. `undefined` si no existe o está borrado. */
  async findById(id: number): Promise<Reporte | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM reporte WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return rows[0] && toEntity(rows[0]);
  }

  /**
   * Inserta un reporte nuevo. `estado_id` se resuelve con un
   * subquery `(SELECT id FROM estado WHERE nombre = 'Pendiente' ...)`
   * en vez de recibirse como parámetro: así el cliente no puede
   * elegir el estado inicial de un reporte.
   * @throws ConflictException si `fuenteId`, `tipoPropiedadId` o
   * `tipoFraudeId` no existen (errno 1452), o si el catálogo
   * `estado` no tiene ninguna fila "Pendiente" (errno 1048 — caso
   * borde si alguien edita los seeds).
   */
  async save(reporte: NuevoReporte): Promise<Reporte> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `INSERT INTO reporte
           (nombre, descripcion, longitud, latitud, foto, usuario_id,
            fuente_id, estado_id, tipo_propiedad_id, tipo_fraude_id)
         VALUES (?, ?, ?, ?, ?, ?, ?,
                 (SELECT id FROM estado WHERE nombre = 'Pendiente' LIMIT 1),
                 ?, ?)`,
        [
          reporte.nombre,
          reporte.descripcion,
          reporte.longitud,
          reporte.latitud,
          reporte.foto,
          reporte.usuarioId,
          reporte.fuenteId,
          reporte.tipoPropiedadId,
          reporte.tipoFraudeId,
        ],
      );
      return (await this.findById(result.insertId))!;
    } catch (err: any) {
      if (err?.errno === FK_ERRNO) {
        throw new ConflictException(
          'fuente, tipo de propiedad o tipo de fraude inválidos',
        );
      }
      if (err?.errno === ESTADO_INICIAL_INEXISTENTE_ERRNO) {
        throw new ConflictException(
          "No existe el estado 'Pendiente' en el catálogo de estados",
        );
      }
      throw err;
    }
  }

  /**
   * Actualiza solo las columnas presentes en `changes` (set dinámico
   * parametrizado), incluyendo `estadoId` si se manda (así es como
   * se mueve un reporte de "Pendiente" a otro estado).
   * @throws ConflictException si alguna FK referenciada no existe.
   */
  async update(
    id: number,
    changes: CambiosReporte,
  ): Promise<Reporte | undefined> {
    const mapaColumnas: Record<string, string> = {
      nombre: 'nombre',
      descripcion: 'descripcion',
      longitud: 'longitud',
      latitud: 'latitud',
      foto: 'foto',
      fuenteId: 'fuente_id',
      estadoId: 'estado_id',
      tipoPropiedadId: 'tipo_propiedad_id',
      tipoFraudeId: 'tipo_fraude_id',
    };

    const columnas: string[] = [];
    const valores: unknown[] = [];

    for (const [campo, columna] of Object.entries(mapaColumnas)) {
      const valor = (changes as Record<string, unknown>)[campo];
      if (valor !== undefined) {
        columnas.push(`${columna} = ?`);
        valores.push(valor);
      }
    }

    if (columnas.length === 0) return this.findById(id);

    try {
      await this.pool.query(
        `UPDATE reporte SET ${columnas.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
        [...valores, id],
      );
      return this.findById(id);
    } catch (err: any) {
      if (err?.errno === FK_ERRNO) {
        throw new ConflictException(
          'fuente, estado, tipo de propiedad o tipo de fraude inválidos',
        );
      }
      throw err;
    }
  }

  /** Marca `deleted_at = NOW()`. Devuelve `false` si el reporte no existía o ya estaba borrado. */
  async softDelete(id: number): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE reporte SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return result.affectedRows > 0;
  }
}

/**
 * Mapea una fila cruda de `mysql2` (snake_case) a {@link Reporte}.
 * Convierte explícitamente `longitud`/`latitud` (columnas `DECIMAL`,
 * que `mysql2` devuelve como string) a `number`.
 */
function toEntity(row: any): Reporte {
  const reporte = new Reporte();
  reporte.id = row.id;
  reporte.nombre = row.nombre;
  reporte.descripcion = row.descripcion;
  reporte.longitud = Number(row.longitud);
  reporte.latitud = Number(row.latitud);
  reporte.foto = row.foto;
  reporte.usuarioId = row.usuario_id;
  reporte.fuenteId = row.fuente_id;
  reporte.estadoId = row.estado_id;
  reporte.tipoPropiedadId = row.tipo_propiedad_id;
  reporte.tipoFraudeId = row.tipo_fraude_id;
  reporte.createdAt = row.created_at;
  reporte.updatedAt = row.updated_at;
  reporte.deletedAt = row.deleted_at;
  return reporte;
}