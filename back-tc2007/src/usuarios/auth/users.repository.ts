import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { DB_POOL } from 'src/database/database.module';
import { User } from './entities/user.entity';

/**
 * Columnas que se leen de `usuario` al construir un {@link User}.
 * Se listan explícitamente en lugar de usar `SELECT *` para no
 * depender del orden ni arrastrar columnas nuevas sin querer.
 */
const COLUMNS =
  'id, correo, contrasena, salt, nombre, created_at, rol_id, deleted_at';

/**
 * Acceso a datos para el flujo de autenticación. Opera sobre la
 * misma tabla `usuario` que {@link UsuariosRepository}
 * (usuarios/usuarios.repository.ts), pero con las queries mínimas
 * que necesita login/registro, más la tabla `recovery_code` para la
 * recuperación de contraseña. Todas las queries son parametrizadas.
 *
 * Los `id` nuevos (de usuario y de código de recuperación) se generan
 * con `Math.random().toString(36).substring(2, 10)`: una cadena
 * base 36 de hasta 8 caracteres. No son UUID ni criptográficamente
 * seguros, y no hay reintento si chocan con un id existente.
 *
 * Valores de `rol_id` que maneja este repositorio:
 * - `1`: usuario final (registro público).
 * - `2`: administrador aprobado.
 * - `4`: solicitud de administrador pendiente.
 */
@Injectable()
export class UsersRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  /**
   * Busca un usuario activo por correo (excluye borrados lógicamente).
   * Usado en login, en recuperación de contraseña y para checar
   * duplicados en registro.
   */
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
   * el registro público nunca puede crear administradores. El `id` se
   * genera aquí mismo (ver nota de la clase sobre su formato) y, tras
   * insertar, se relee la fila con {@link findById} para devolver la
   * entidad con los valores que puso la base (p. ej. `created_at`).
   */
  async save(correo: string, contrasena: string, salt: string, nombre: string): Promise<User> {
    const id = Math.random().toString(36).substring(2, 10);
    await this.pool.query<ResultSetHeader>(
      `INSERT INTO usuario
                (id, correo, contrasena, salt, nombre, rol_id)
             VALUES (?, ?, ?, ?, ?, 1)`,
      [id, correo, contrasena, salt, nombre],
    );
    return (await this.findById(id))!;
  }

  /**
   * Igual que {@link save}, pero inserta con `rol_id = 4` (solicitud
   * de administrador pendiente). La cuenta no tiene acceso a nada hasta
   * que {@link approveAdmin} la promueva.
   */
  async saveAdmin(correo: string, contrasena: string, salt: string, nombre: string): Promise<User> {
    const id = Math.random().toString(36).substring(2, 10);
    await this.pool.query(
      `INSERT INTO usuario
        (id, correo, contrasena, salt, nombre, rol_id)
      VALUES (?, ?, ?, ?, ?, 4)`,
      [id, correo, contrasena, salt, nombre],
    );

    return (await this.findById(id))!;
  }

  /**
   * Lista las solicitudes de administrador pendientes (`rol_id = 4`)
   * activas. Devuelve filas crudas, no entidades, y solo con los
   * campos que necesita el dashboard: nunca expone hash ni salt.
   */
  async findPendingAdmins() {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT id, correo, nombre, created_at
      FROM usuario
      WHERE rol_id = 4
      AND deleted_at IS NULL`
    );
    return rows;
  }

  /**
   * Promueve una solicitud pendiente a administrador (`rol_id` de 4
   * a 2). La condición `rol_id = 4` en el `WHERE` hace que la
   * operación sea idempotente y segura: no afecta a usuarios que no
   * estén pendientes.
   *
   * @returns `true` si se actualizó una fila; `false` si el id no
   * existe, ya fue aprobado o está borrado.
   */
  async approveAdmin(id: string): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE usuario
      SET rol_id = 2
      WHERE id = ?
      AND rol_id = 4
      AND deleted_at IS NULL`,
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Busca un usuario activo por id. Hoy solo se usa internamente para
   * releer la fila recién insertada en {@link save} y {@link saveAdmin}.
   */
  async findById(id: string): Promise<User | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM usuario WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return rows[0] && toEntity(rows[0]);
  }

  /**
   * Guarda un código de recuperación de contraseña, marcado como no
   * usado. No invalida códigos anteriores del mismo usuario: si pide
   * varios, todos siguen siendo válidos hasta que expiren o se usen.
   */
  async createRecoveryCode(usuarioId: string, codigo: string, expiraEn: Date): Promise<void> {
    const id = Math.random().toString(36).substring(2, 10);
    await this.pool.query<ResultSetHeader>(
      `INSERT INTO recovery_code
        (id, usuario_id, codigo, expira_en, usado)
       VALUES (?, ?, ?, ?, FALSE)`,
      [id, usuarioId, codigo, expiraEn],
    );
  }

  /**
   * Busca un código de recuperación no usado que coincida con el
   * usuario y el código. No filtra por expiración: esa validación la
   * hace {@link AuthService.resetPassword} con `expira_en`.
   *
   * @returns La fila cruda de `recovery_code`, o `undefined` si no hay
   * coincidencia.
   */
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

  /** Marca un código de recuperación como usado para que no se pueda reutilizar. */
  async useRecoveryCode(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE recovery_code
       SET usado = TRUE
       WHERE id = ?`,
      [id],
    );
  }

  /**
   * Reemplaza el hash y el salt de un usuario. Ambos se actualizan
   * juntos porque el hash solo es verificable con su propio salt.
   * No filtra por `deleted_at`; la existencia del usuario se valida
   * antes en el servicio.
   */
  async updatePassword(usuarioId: string, contrasena: string, salt: string): Promise<void> {
    await this.pool.query(
      `UPDATE usuario
      SET contrasena = ?, salt = ?
      WHERE id = ?`,
      [contrasena, salt, usuarioId],
    );
  }
}

/**
 * Mapea una fila cruda de `mysql2` (snake_case, nombres en español) a
 * {@link User}. Aunque {@link COLUMNS} lee `nombre` y `deleted_at`,
 * esos campos no se copian a la entidad.
 */
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