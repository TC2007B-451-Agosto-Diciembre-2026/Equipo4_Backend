import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Usuario } from './entities/usuario.entity';

const COLUMNS = 'id, correo, contrasena, salt, nombre, rol_id, created_at, deleted_at';

@Injectable()
export class UsuariosRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<Usuario[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM usuario WHERE deleted_at IS NULL ORDER BY created_at`,
    );
    return rows.map(toEntity);
  }

  async findById(id: number): Promise<Usuario | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM usuario WHERE id = ${id} AND deleted_at IS NULL`,
    );
    return rows[0] && toEntity(rows[0]);
  }

  async save(
    usuario: Omit<Usuario, 'id' | 'createdAt' | 'deletedAt'>,
  ): Promise<Usuario> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO usuario (correo, contrasena, nombre, rol_id)
       VALUES ('${usuario.correo}', '${usuario.contrasena}', '${usuario.salt}', '${usuario.nombre}', ${usuario.rolId})`,
    );
    return (await this.findById(result.insertId))!;
  }

  async update(
    id: number,
    changes: Partial<Usuario>,
  ): Promise<Usuario | undefined> {
    const { rolId, ...rest } = changes as any;
    const columnas: string[] = [];
    if (rest.correo !== undefined) columnas.push(`correo = '${rest.correo}'`);
    if (rest.contrasena !== undefined)
      columnas.push(`contrasena = '${rest.contrasena}'`);
    if (rest.salt !== undefined)
      columnas.push(`salt = '${rest.salt}'`);
    if (rest.nombre !== undefined) columnas.push(`nombre = '${rest.nombre}'`);
    if (rolId !== undefined) columnas.push(`rol_id = ${rolId}`);

    if (columnas.length === 0) return this.findById(id);

    await this.pool.query(
      `UPDATE usuario SET ${columnas.join(', ')} WHERE id = ${id} AND deleted_at IS NULL`,
    );
    return this.findById(id);
  }

  async softDelete(id: number): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE usuario SET deleted_at = NOW() WHERE id = ${id} AND deleted_at IS NULL`,
    );
    return result.affectedRows > 0;
  }
}

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