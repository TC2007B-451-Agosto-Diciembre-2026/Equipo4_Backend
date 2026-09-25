import { ApiProperty } from '@nestjs/swagger';

/**
 * Respuesta de `POST /reportes/fotos`: referencia a la foto recién
 * subida a la carpeta temporal. `fotoTemp` es lo que hay que mandar
 * en `CreateReporteDto.fotoTemp` al hacer `POST /reportes`.
 */
export class FotoTempResponseDto {
  /** Nombre del archivo en la carpeta temporal (ver {@link FOTOS_TMP_DIR}). */
  @ApiProperty({ example: 'a3f1c2a0-4e9d-4a7a-9c2e-1f8a6d2b7e10.jpg' })
  fotoTemp!: string;

  /**
   * URL pública para previsualizar la foto mientras sigue en
   * temporales. Deja de ser válida una vez que `POST /reportes` la
   * mueve a la carpeta definitiva (la URL final queda en
   * `ReporteResponseDto.fotoUrl`).
   */
  @ApiProperty({ example: '/uploads/tmp/a3f1c2a0-4e9d-4a7a-9c2e-1f8a6d2b7e10.jpg' })
  url!: string;
}