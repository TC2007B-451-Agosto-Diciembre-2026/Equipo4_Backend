import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Fuente } from './entities/fuente.entity';

const COLUMNS = 'id, tipo_fuente, valor_fuente';

/**
 * Acceso a datos de `fuente` (catálogo, sin borrado lógico). Todas
 * las queries son parametrizadas.
 */
@Injectable()
export class FuentesRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  /** Lista todas las fuentes. */
  async findAll(): Promise<Fuente[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM fuente ORDER BY id`,
    );
    return rows.map(toEntity);
  }

  /** Busca una fuente por id. `undefined` si no existe. */
  async findById(id: number): Promise<Fuente | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM fuente WHERE id = ?`,
      [id],
    );
    return rows[0] && toEntity(rows[0]);
  }

  /** Inserta una fuente nueva. */
  async save(fuente: Omit<Fuente, 'id'>): Promise<Fuente> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO fuente (tipo_fuente, valor_fuente) VALUES (?, ?)`,
      [fuente.tipoFuente, fuente.valorFuente],
    );
    return (await this.findById(result.insertId))!;
  }

  /** Actualiza solo las columnas presentes en `changes` (set dinámico parametrizado). */
  async update(
    id: number,
    changes: Partial<Fuente>,
  ): Promise<Fuente | undefined> {
    const columnas: string[] = [];
    const valores: unknown[] = [];

    if (changes.tipoFuente !== undefined) {
      columnas.push('tipo_fuente = ?');
      valores.push(changes.tipoFuente);
    }
    if (changes.valorFuente !== undefined) {
      columnas.push('valor_fuente = ?');
      valores.push(changes.valorFuente);
    }

    if (columnas.length === 0) return this.findById(id);

    await this.pool.query(
      `UPDATE fuente SET ${columnas.join(', ')} WHERE id = ?`,
      [...valores, id],
    );
    return this.findById(id);
  }

  /**
   * Borra físicamente la fuente.
   * @throws ConflictException si algún `reporte` la referencia
   * (violación de FK, errno 1451).
   */
  async remove(id: number): Promise<boolean> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `DELETE FROM fuente WHERE id = ?`,
        [id],
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      if (err?.errno === 1451) {
        throw new ConflictException(
          'No se puede eliminar: la fuente está en uso en uno o más reportes',
        );
      }
      throw err;
    }
  }
}

/** Mapea una fila cruda de `mysql2` a {@link Fuente}. */
function toEntity(row: any): Fuente {
  const fuente = new Fuente();
  fuente.id = row.id;
  fuente.tipoFuente = row.tipo_fuente;
  fuente.valorFuente = row.valor_fuente;
  return fuente;
}
