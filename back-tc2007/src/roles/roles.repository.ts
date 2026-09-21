import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Rol } from './entities/rol.entity';

const COLUMNS = 'id, nombre, alias';

/**
 * Acceso a datos de `rol` (catálogo, sin borrado lógico — no tiene
 * columna `deleted_at`). Todas las queries son parametrizadas.
 */
@Injectable()
export class RolesRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  /** Lista todos los roles. */
  async findAll(): Promise<Rol[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM rol ORDER BY id`,
    );
    return rows.map(toEntity);
  }

  /** Busca un rol por id. `undefined` si no existe. */
  async findById(id: number): Promise<Rol | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM rol WHERE id = ?`,
      [id],
    );
    return rows[0] && toEntity(rows[0]);
  }

  /**
   * Inserta un rol nuevo.
   * @throws Error de MySQL si `nombre` o `alias` ya existen (ambos son
   * `UNIQUE`); no se traduce a un error HTTP específico aquí.
   */
  async save(rol: Omit<Rol, 'id'>): Promise<Rol> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO rol (nombre, alias) VALUES (?, ?)`,
      [rol.nombre, rol.alias],
    );
    return (await this.findById(result.insertId))!;
  }

  /** Actualiza solo las columnas presentes en `changes` (set dinámico parametrizado). */
  async update(id: number, changes: Partial<Rol>): Promise<Rol | undefined> {
    const columnas: string[] = [];
    const valores: unknown[] = [];

    if (changes.nombre !== undefined) {
      columnas.push('nombre = ?');
      valores.push(changes.nombre);
    }
    if (changes.alias !== undefined) {
      columnas.push('alias = ?');
      valores.push(changes.alias);
    }

    if (columnas.length === 0) return this.findById(id);

    await this.pool.query(
      `UPDATE rol SET ${columnas.join(', ')} WHERE id = ?`,
      [...valores, id],
    );
    return this.findById(id);
  }

  /**
   * Borra físicamente el rol (no hay soft delete en catálogos).
   * @throws ConflictException si algún `usuario` todavía referencia
   * este rol (violación de FK, errno 1451), en vez de dejar que MySQL
   * tire un error crudo.
   */
  async remove(id: number): Promise<boolean> {
    try {
      const [result] = await this.pool.query<ResultSetHeader>(
        `DELETE FROM rol WHERE id = ?`,
        [id],
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      if (err?.errno === 1451) {
        throw new ConflictException(
          'No se puede eliminar: el rol está asignado a uno o más usuarios',
        );
      }
      throw err;
    }
  }
}

/** Mapea una fila cruda de `mysql2` a {@link Rol}. */
function toEntity(row: any): Rol {
  const rol = new Rol();
  rol.id = row.id;
  rol.nombre = row.nombre;
  rol.alias = row.alias;
  return rol;
}
