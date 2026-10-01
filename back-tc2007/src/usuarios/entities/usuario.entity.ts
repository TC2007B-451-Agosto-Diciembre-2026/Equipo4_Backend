/**
 * Representa una fila de la tabla `usuario`.
 *
 * Modelo interno de dominio: incluye campos sensibles (`contrasena`,
 * `salt`) que nunca deben salir de la capa de repositorio/servicio.
 * Para exponer un usuario al cliente HTTP usa siempre
 * {@link UsuarioResponseDto.fromEntity}, que omite estos campos.
 */
export class Usuario {
  /**
   * Identificador único (PK), un UUID v4 generado en la aplicación
   * con `crypto.randomUUID()` al crear el usuario (no es
   * autoincremental). Se eligió UUID para que el id no sea
   * adivinable/enumerable por un cliente malicioso.
   */
  id!: string;

  /** Correo electrónico, único en la tabla. Se usa como login. */
  correo!: string;

  /** Hash de la contraseña (bcrypt/hash con salt). Nunca se expone. */
  contrasena!: string;

  /** Salt usado para el hash de la contraseña. Nunca se expone. */
  salt: string | undefined;

  /** Nombre para mostrar del usuario. */
  nombre!: string;

  /** FK hacia `rol.id`; determina los permisos del usuario. */
  rolId!: number;

  /** Fecha de creación del registro (`created_at`). */
  createdAt!: Date;

  /**
   * Fecha de borrado lógico (`deleted_at`). `null` mientras el usuario
   * esté activo; el repositorio filtra por `deleted_at IS NULL` en
   * todas las lecturas.
   */
  deletedAt!: Date | null;
}