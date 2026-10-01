/**
 * Representa una fila de la tabla `fuente`: catálogo de dónde vino
 * un reporte de fraude (plataforma, red social, mensajería, etc.).
 * Referenciada por `reporte.fuente_id`.
 */
export class Fuente {
  /** Identificador autoincremental (PK). */
  id!: number;

  /** Categoría de la fuente (ej. "Plataforma", "Red social"). */
  tipoFuente!: string;

  /** Valor específico dentro de la categoría (ej. "Airbnb", "WhatsApp"). */
  valorFuente!: string;
}
