/**
 * Representa una fila de la tabla `reporte`: un reporte de fraude
 * enviado por un usuario. Es la entidad central del sistema, con 5
 * FKs hacia sus catálogos (`fuente`, `estado`, `tipo_propiedad`,
 * `tipo_fraude`) y hacia `usuario`.
 */
export class Reporte {
  /** Identificador autoincremental (PK). */
  id!: number;

  /** Título/nombre corto del reporte. */
  nombre!: string;

  /** Descripción detallada del fraude reportado. */
  descripcion!: string;

  /** Longitud geográfica (DECIMAL(11,8) en la BD). */
  longitud!: number;

  /** Latitud geográfica (DECIMAL(10,8) en la BD). */
  latitud!: number;

/**
 * Ruta pública de la foto de evidencia (ej. `/uploads/reportes/<uuid>.jpg`),
 * servida como estático desde `main.ts`. Ya no se guarda como base64:
 * la foto se sube primero a una carpeta temporal (`POST /reportes/fotos`)
 * y se mueve aquí al crear el reporte (ver {@link ReportesService.create}).
 */
  foto!: string;

/**
 * FK hacia `usuario.id` (UUID). Se asigna a partir del token del
 * usuario autenticado (`CurrentUser().sub`), nunca desde el body:
 * así un usuario no puede crear reportes a nombre de otro.
 */
  usuarioId!: string;

  /** FK hacia `fuente.id`. */
  fuenteId!: number;

  /**
   * FK hacia `estado.id`. Todo reporte nuevo nace en "Pendiente"
   * (asignado por el repository vía subquery, no elegible en la
   * creación); solo cambia después con `PATCH /reportes/:id`.
   */
  estadoId!: number;

  /** FK hacia `tipo_propiedad.id`. */
  tipoPropiedadId!: number;

  /** FK hacia `tipo_fraude.id`. */
  tipoFraudeId!: number;

  /** Fecha de creación (`created_at`). */
  createdAt!: Date;

  /** Fecha de última modificación (`updated_at`, `ON UPDATE CURRENT_TIMESTAMP`). `null` si nunca se ha actualizado. */
  updatedAt!: Date | null;

  /** Fecha de borrado lógico (`deleted_at`). `null` mientras el reporte esté activo. */
  deletedAt!: Date | null;
}
