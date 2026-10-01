import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { DB_POOL } from 'src/database/database.module';
import { User } from './entities/user.entity';

const COLUMNS =
  'id, correo, contrasena, salt, nombre, created_at, rol_id, deleted_at';

/**
 * Acceso a datos para el flujo de autenticación. Opera sobre la
 * misma tabla `usuario` que {@link UsuariosRepository}
 * (usuarios/usuarios.repository.ts), pero con las queries mínimas
 * que necesita login/registro. Todas las queries son parametrizadas.
 */
@Injectable()
export class UsersRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  /** Busca un usuario activo por correo. Usado en login y para checar duplicados en registro. */
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

  /**
   * Inserta un usuario nuevo con `rol_id = 1` (rol "Usuario") fijo:
   * el registro público nunca puede crear administradores. El `id`
   * (UUID v4) se genera aquí mismo con `crypto.randomUUID()`, igual
   * que en {@link UsuariosRepository.save} (usuarios/usuarios.repository.ts).
   */
  async save(
    correo: string,
    contrasena: string,
    salt: string,
    nombre: string,
  ): Promise<User> {
    const id = randomUUID();
    await this.pool.query<ResultSetHeader>(
      `INSERT INTO usuario
                (id, correo, contrasena, salt, nombre, rol_id)
             VALUES (?, ?, ?, ?, ?, 1)`,
      [id, correo, contrasena, salt, nombre],
    );
    return (await this.findById(id))!;
  }

  async saveAdmin(correo: string, contrasena: string, salt: string, nombre: string): Promise<User> {
    const id = randomUUID();
    await this.pool.query(
      `INSERT INTO usuario
        (id, correo, contrasena, salt, nombre, rol_id)
      VALUES (?, ?, ?, ?, ?, 2)`,
      [id, correo, contrasena, salt, nombre],
    );

    return (await this.findById(id))!;
  }

  /** Busca un usuario activo por id (UUID). Usado al refrescar el token. */
  async findById(id: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM usuario WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return rows[0] && toEntity(rows[0]);
  }

    async createRecoveryCode(usuarioId: string, codigo: string, expiraEn: Date): Promise<void> {
    const id = randomUUID();
    await this.pool.query<ResultSetHeader>(
      `INSERT INTO recovery_code
        (id, usuario_id, codigo, expira_en, usado)
       VALUES (?, ?, ?, ?, FALSE)`,
      [id, usuarioId, codigo, expiraEn],
    );
  }

  async findRecoveryCode(usuarioId: string, codigo: string): Promise<RowDataPacket | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT id, usuario_id, codigo, expira_en, usado
       FROM recovery_code
       WHERE usuario_id = ?
       AND codigo = ?
       AND usado = FALSE`,
      [usuarioId, codigo],
    );
    return rows[0];
  }

  async useRecoveryCode(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE recovery_code
       SET usado = TRUE
       WHERE id = ?`,
      [id],
    );
  }

  async updatePassword(usuarioId: string, contrasena: string, salt: string): Promise<void> {
    await this.pool.query(
      `UPDATE usuario
      SET contrasena = ?, salt = ?
      WHERE id = ?`,
      [contrasena, salt, usuarioId],
    );
  }
}

/** Mapea una fila cruda de `mysql2` (snake_case) a {@link User}. */
function toEntity(row: any): User {
  const user = new User();

  user.id = row.id;
  user.email = row.correo;
  user.passwordHash = row.contrasena;
  user.salt = row.salt;
  user.createdAt = row.created_at;
  user.rolId = row.rol_id;
  return user;
}