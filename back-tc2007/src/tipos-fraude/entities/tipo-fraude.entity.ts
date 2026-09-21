/**
 * Representa una fila de la tabla `tipo_fraude`: catálogo del tipo
 * de fraude reportado (propiedad inexistente, suplantación de
 * anfitrión, etc.). Referenciada por `reporte.tipo_fraude_id`.
 */
export class TipoFraude {
  /** Identificador autoincremental (PK). */
  id!: number;

  /** Nombre del tipo de fraude, único. */
  nombre!: string;
}
