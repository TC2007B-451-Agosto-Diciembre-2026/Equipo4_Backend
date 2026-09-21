/**
 * Representa una fila de la tabla `tipo_propiedad`: catálogo del
 * tipo de alojamiento reportado (departamento, casa completa,
 * habitación privada, etc.). Referenciada por `reporte.tipo_propiedad_id`.
 */
export class TipoPropiedad {
  /** Identificador autoincremental (PK). */
  id!: number;

  /** Nombre del tipo de propiedad, único. */
  nombre!: string;
}
