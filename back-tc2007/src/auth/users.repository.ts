import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { User } from './entities/user.entity';

const COLUMNS = 'id, correo, contrasena, created_at';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM usuario WHERE correo = '${email}'`,
    );
    return rows[0] && toEntity(rows[0]);
  }

  async save(email: string, passwordHash: string): Promise<User> {
    await this.pool.query(
      `INSERT INTO usuario (correo, contrasena)
       VALUES ('${email}', '${passwordHash}')`,
    );
    return (await this.findByEmail(email))!;
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