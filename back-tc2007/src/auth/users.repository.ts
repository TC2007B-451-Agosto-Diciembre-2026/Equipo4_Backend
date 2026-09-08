import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { User } from './entities/user.entity';

const COLUMNS =
    'id, correo, contrasena, nombre, created_at, rol_id, deleted_at';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findByEmail(correo: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
            `SELECT ${COLUMNS}
             FROM usuario
             WHERE correo = ?
             AND deleted_at IS NULL`,
            [correo],
        );
    return rows[0] && toEntity(rows[0]);
  }

  async save(correo: string, contrasena: string, nombre: string): Promise<User> {
    const [result] = await this.pool.query(
            `INSERT INTO usuario
                (correo, contrasena, nombre, rol_id)
             VALUES (?, ?, ?, 1)`,
            [correo, contrasena, nombre],
        );
    return (await this.findById((result as any).insertId))!;
  }

  async findById(id: number): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM usuario WHERE id = ? AND deleted_at IS NULL`, [id],
    );
      return rows[0] && toEntity(rows[0]);
    }
}

function toEntity(row: any): User {
  const user = new User();

  user.id = row.id;
  user.email = row.correo;
  user.passwordHash = row.contrasena;
  user.createdAt = row.created_at;
  return user;
}