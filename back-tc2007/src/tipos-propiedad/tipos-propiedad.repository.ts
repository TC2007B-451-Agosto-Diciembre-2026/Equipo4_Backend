import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { TipoPropiedad } from './entities/tipo-propiedad.entity';

const COLUMNS = 'id, nombre';

/**
 * Acceso a datos de `tipo_propiedad` (catálogo, sin borrado lógico).
 * Todas las queries son parametrizadas.
 */
@Injectable()
export class TiposPropiedadRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  /** Lista todos los tipos de propiedad. */
  async findAll(): Promise<TipoPropiedad[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM tipo_propiedad ORDER BY id`,
    );
    return rows.map(toEntity);
  }

  /** Busca un tipo de propiedad por id. `undefined` si no existe. */
  async findById(id: number): Promise<TipoPropiedad | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM tipo_propiedad WHERE id = ?`,
      [id],
    );
    return rows[0] && toEntity(rows[0]);
  }

  /** Inserta un tipo de propiedad nuevo. */
  async save(tipo: Omit<TipoPropiedad, 'id'>): Promise<TipoPropiedad> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO tipo_propiedad (nombre) VALUES (?)`,
      [tipo.nombre],
    );
    return (await this.findById(result.insertId))!;
  }

  /** Actualiza el nombre del tipo de propiedad, si viene presente en `changes`. */
  async update(
    id: number,
    changes: Partial<TipoPropiedad>,
  ): Promise<TipoPropiedad | undefined> {
    if (changes.nombre === undefined) return this.findById(id);

    await this.pool.query(
      `UPDATE tipo_propiedad SET nombre = ? WHERE id = ?`,
      [changes.nombre, id],
    );
    return this.findById(id);
  }

  /**
   * Borra físicamente el tipo de propiedad.
   * @throws ConflictException si algún `reporte` lo referencia
   * (violación de FK, errno 1451).
   */
  async remove(id: number): Promise<boolean> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `DELETE FROM tipo_propiedad WHERE id = ?`,
        [id],
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      if (err?.errno === 1451) {
        throw new ConflictException(
          'No se puede eliminar: el tipo de propiedad está en uso en uno o más reportes',
        );
      }
      throw err;
    }
  }
}

/** Mapea una fila cruda de `mysql2` a {@link TipoPropiedad}. */
function toEntity(row: any): TipoPropiedad {
  const tipo = new TipoPropiedad();
  tipo.id = row.id;
  tipo.nombre = row.nombre;
  return tipo;
}