/**
 * Representa una fila de la tabla `rol`, catálogo referenciado por
 * `usuario.rol_id`. Determina los permisos del usuario (ej. "Usuario"
 * vs "Administrador").
 */
export class Rol {
  /** Identificador autoincremental (PK). */
  id!: number;

  /** Nombre para mostrar, único (ej. "Administrador"). */
  nombre!: string;

  /** Slug corto único usado internamente (ej. "admin"). */
  alias!: string;
}
