import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Usuario } from './entities/usuario.entity';

const COLUMNS =
  'id, correo, contrasena, salt, nombre, rol_id, created_at, deleted_at';

/**
 *
 * Aplica borrado lógico: toda lectura filtra `deleted_at IS NULL`.
 */
@Injectable()
export class UsuariosRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  /** Lista los usuarios activos, ordenados por fecha de creación. */
   async findAll(): Promise<Usuario[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM usuario WHERE deleted_at IS NULL ORDER BY created_at`,
    );
    return rows.map(toEntity);
  }

  /** Busca un usuario activo por id (UUID). `undefined` si no existe o está borrado. */
    async findById(id: string): Promise<Usuario | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM usuario WHERE id = '${id}' AND deleted_at IS NULL`,
    );
    return rows[0] && toEntity(rows[0]);
  }

  /**
   * Inserta un usuario nuevo y devuelve la fila insertada. El `id`
   * (UUID v4) se genera aquí en la aplicación con `crypto.randomUUID()`
   * y se manda explícito en el INSERT — la tabla ya no tiene
   * AUTO_INCREMENT, así que no hay `insertId` del que depender.
   * @throws ConflictException si `rolId` no referencia un rol existente
   * (violación de la FK `fk_usuario_rol`, errno 1452).
   */
  async save(
    usuario: Omit<Usuario, 'id' | 'createdAt' | 'deletedAt'>,
  ): Promise<Usuario> {
    const id = randomUUID();
    try {
      await this.pool.query<ResultSetHeader>(
        `INSERT INTO usuario (id, correo, contrasena, salt, nombre, rol_id)
         VALUES ('${id}', '${usuario.correo}', '${usuario.contrasena}', '${usuario.salt}', '${usuario.nombre}', ${usuario.rolId})`,
      );
      return (await this.findById(id))!;
    } catch (err: any) {
      if (err?.errno === 1452) {
        throw new ConflictException('El rol especificado no existe');
      }
      throw err;
    }
  }

  /**
   * Actualiza solo las columnas presentes en `changes` (patrón
   * "set dinámico" parametrizado). Si `changes` viene vacío, no
   * ejecuta ningún UPDATE y simplemente relee la fila.
   * @throws ConflictException si `rolId` no referencia un rol existente.
   */
  async update(
    id: string,
    changes: Partial<Usuario>,
  ): Promise<Usuario | undefined> {
    const asignaciones: string[] = [];

    if (changes.correo !== undefined) {
      asignaciones.push(`correo = '${changes.correo}'`);
    }
    if (changes.contrasena !== undefined) {
      asignaciones.push(`contrasena = '${changes.contrasena}'`);
    }
    if (changes.salt !== undefined) {
      asignaciones.push(`salt = '${changes.salt}'`);
    }
    if (changes.nombre !== undefined) {
      asignaciones.push(`nombre = '${changes.nombre}'`);
    }
    if (changes.rolId !== undefined) {
      asignaciones.push(`rol_id = ${changes.rolId}`);
    }

    if (asignaciones.length === 0) return this.findById(id);

    try {
      await this.pool.query(
        `UPDATE usuario SET ${asignaciones.join(', ')} WHERE id = '${id}' AND deleted_at IS NULL`,
      );
    } catch (err: any) {
      if (err?.errno === 1452) {
        throw new ConflictException('El rol especificado no existe');
      }
      throw err;
    }
    return this.findById(id);
  }

  /**
   * Marca `deleted_at = NOW()`. Devuelve `false` si el usuario no
   * existía o ya estaba borrado (no lanza excepción; el service
   * decide si eso es un 404).
   */
  async softDelete(id: string): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE usuario SET deleted_at = NOW() WHERE id = '${id}' AND deleted_at IS NULL`,
    );
    return result.affectedRows > 0;
  }
}

/** Mapea una fila cruda de `mysql2` (snake_case) a {@link Usuario}. */
function toEntity(row: any): Usuario {
  const usuario = new Usuario();
  usuario.id = row.id;
  usuario.correo = row.correo;
  usuario.contrasena = row.contrasena;
  usuario.salt = row.salt;
  usuario.nombre = row.nombre;
  usuario.rolId = row.rol_id;
  usuario.createdAt = row.created_at;
  usuario.deletedAt = row.deleted_at;
  return usuario;
}