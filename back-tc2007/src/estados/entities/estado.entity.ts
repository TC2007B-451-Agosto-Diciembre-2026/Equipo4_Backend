/**
 * Representa una fila de la tabla `estado`: catálogo del ciclo de
 * vida de un reporte ("Pendiente", "En revisión", "Verificado",
 * "Rechazado", "Cerrado"). Referenciada por `reporte.estado_id`.
 *
 * Todo reporte nuevo se crea con el estado "Pendiente" (asignado
 * automáticamente por {@link ReportesRepository.save}, no elegible
 * por el cliente).
 */
export class Estado {
  /** Identificador autoincremental (PK). */
  id!: number;

  /** Nombre del estado, único. */
  nombre!: string;
}
