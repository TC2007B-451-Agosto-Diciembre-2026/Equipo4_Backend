import { join } from 'node:path';

/**
 * Carpeta raíz de archivos subidos. Se publica como estáticos en
 * `/uploads/*` desde `main.ts` (`app.useStaticAssets`), así que todo
 * lo que quede dentro es públicamente visible por URL.
 */
export const UPLOADS_ROOT = join(process.cwd(), 'uploads');

/**
 * Carpeta temporal: aquí cae una foto recién subida vía
 * `POST /reportes/fotos`, antes de que exista el reporte al que
 * pertenece. Un archivo aquí ya es públicamente visible (para poder
 * previsualizarlo), pero todavía no está asociado a ningún reporte.
 */
export const FOTOS_TMP_DIR = join(UPLOADS_ROOT, 'tmp');

/**
 * Carpeta definitiva: `ReportesService.create`/`update` mueve aquí el
 * archivo desde `FOTOS_TMP_DIR` al confirmar el reporte.
 */
export const FOTOS_REPORTES_DIR = join(UPLOADS_ROOT, 'reportes');