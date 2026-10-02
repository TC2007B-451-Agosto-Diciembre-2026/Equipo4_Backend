import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { TipoFraude } from './entities/tipo-fraude.entity';

const COLUMNS = 'id, nombre';

/**
 * Acceso a datos de `tipo_fraude` (catálogo, sin borrado lógico).
 * Todas las queries son parametrizadas.
 */
@Injectable()
export class TiposFraudeRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  /** Lista todos los tipos de fraude. */
  async findAll(): Promise<TipoFraude[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM tipo_fraude ORDER BY id`,
    );
    return rows.map(toEntity);
  }

  /** Busca un tipo de fraude por id. `undefined` si no existe. */
  async findById(id: number): Promise<TipoFraude | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM tipo_fraude WHERE id = ?`,
      [id],
    );
    return rows[0] && toEntity(rows[0]);
  }

  /** Inserta un tipo de fraude nuevo. */
  async save(tipo: Omit<TipoFraude, 'id'>): Promise<TipoFraude> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO tipo_fraude (nombre) VALUES (?)`,
      [tipo.nombre],
    );
    return (await this.findById(result.insertId))!;
  }

  /** Actualiza el nombre del tipo de fraude, si viene presente en `changes`. */
  async update(
    id: number,
    changes: Partial<TipoFraude>,
  ): Promise<TipoFraude | undefined> {
    if (changes.nombre === undefined) return this.findById(id);

    await this.pool.query(`UPDATE tipo_fraude SET nombre = ? WHERE id = ?`, [
      changes.nombre,
      id,
    ]);
    return this.findById(id);
  }

  /**
   * Borra físicamente el tipo de fraude.
   * @throws ConflictException si algún `reporte` lo referencia
   * (violación de FK, errno 1451).
   */
  async remove(id: number): Promise<boolean> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `DELETE FROM tipo_fraude WHERE id = ?`,
        [id],
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      if (err?.errno === 1451) {
        throw new ConflictException(
          'No se puede eliminar: el tipo de fraude está en uso en uno o más reportes',
        );
      }
      throw err;
    }
  }
}

/** Mapea una fila cruda de `mysql2` a {@link TipoFraude}. */
function toEntity(row: any): TipoFraude {
  const tipo = new TipoFraude();
  tipo.id = row.id;
  tipo.nombre = row.nombre;
  return tipo;
}
