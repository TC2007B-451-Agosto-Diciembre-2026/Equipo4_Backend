import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Estado } from './entities/estado.entity';

const COLUMNS = 'id, nombre';

/**
 * Acceso a datos de `estado` (catálogo, sin borrado lógico). Todas
 * las queries son parametrizadas.
 */
@Injectable()
export class EstadosRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  /** Lista todos los estados. */
  async findAll(): Promise<Estado[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM estado ORDER BY id`,
    );
    return rows.map(toEntity);
  }

  /** Busca un estado por id. `undefined` si no existe. */
  async findById(id: number): Promise<Estado | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM estado WHERE id = ?`,
      [id],
    );
    return rows[0] && toEntity(rows[0]);
  }

  /** Inserta un estado nuevo. */
  async save(estado: Omit<Estado, 'id'>): Promise<Estado> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO estado (nombre) VALUES (?)`,
      [estado.nombre],
    );
    return (await this.findById(result.insertId))!;
  }

  /** Actualiza el nombre del estado, si viene presente en `changes`. */
  async update(
    id: number,
    changes: Partial<Estado>,
  ): Promise<Estado | undefined> {
    if (changes.nombre === undefined) return this.findById(id);

    await this.pool.query(`UPDATE estado SET nombre = ? WHERE id = ?`, [
      changes.nombre,
      id,
    ]);
    return this.findById(id);
  }

  /**
   * Borra físicamente el estado.
   * @throws ConflictException si algún `reporte` lo referencia
   * (violación de FK, errno 1451). En particular, no debería poderse
   * borrar "Pendiente" mientras haya reportes activos, ya que ese es
   * el estado por default de todo reporte nuevo.
   */
  async remove(id: number): Promise<boolean> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `DELETE FROM estado WHERE id = ?`,
        [id],
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      if (err?.errno === 1451) {
        throw new ConflictException(
          'No se puede eliminar: el estado está en uso en uno o más reportes',
        );
      }
      throw err;
    }
  }
}

/** Mapea una fila cruda de `mysql2` a {@link Estado}. */
function toEntity(row: any): Estado {
  const estado = new Estado();
  estado.id = row.id;
  estado.nombre = row.nombre;
  return estado;
}