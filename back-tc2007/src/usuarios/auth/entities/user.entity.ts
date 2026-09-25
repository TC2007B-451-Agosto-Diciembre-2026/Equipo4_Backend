/**
 * Modelo interno usado solo por el flujo de autenticación
 * ({@link AuthService}). Es una proyección distinta de
 * {@link Usuario} (usuarios/entities/usuario.entity.ts) sobre la
 * misma tabla `usuario`; existe porque `UsersRepository` solo
 * necesita los campos relevantes para login/registro.
 */
export class User {
  /** UUID v4 (PK de `usuario`), generado en la aplicación al registrar. */
  id: string | undefined;
  email: string | undefined;
  /** Hash de la contraseña. Nunca se expone en una respuesta HTTP. */
  passwordHash: string | undefined;
  /** Salt usado para el hash. Nunca se expone en una respuesta HTTP. */
  salt: string | undefined;
  nombre: string | undefined;
  createdAt: Date | undefined;
  rolId: number | undefined;
  deletedAt: Date | undefined;
}