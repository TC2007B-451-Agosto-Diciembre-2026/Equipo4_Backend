import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
} from 'class-validator';

/**
 * Datos para crear un reporte vía `POST /reportes`.
 *
 * Dos campos de {@link Reporte} se excluyen deliberadamente de este
 * DTO (no se aceptan del cliente):
 * - `usuarioId`: se toma del token (`CurrentUser().sub`) en el
 *   controller, para que un usuario no pueda crear reportes a
 *   nombre de otro.
 * - `estadoId`: todo reporte nuevo nace en "Pendiente" (asignado
 *   por default en `ReportesRepository.save`); el estado solo se
 *   cambia después vía `PATCH /reportes/:id` (ver {@link UpdateReporteDto}).
 */
export class CreateReporteDto {
  /** Título/nombre corto del reporte. */
  @ApiProperty({ example: 'Departamento fantasma en Polanco' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  /** Descripción detallada del fraude reportado. */
  @ApiProperty({
    example: 'El anfitrión pidió depósito fuera de la plataforma y desapareció.',
  })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  /** Longitud geográfica. */
  @ApiProperty({ example: -99.1332 })
  @IsLongitude()
  longitud!: number;

  /** Latitud geográfica. */
  @ApiProperty({ example: 19.4326 })
  @IsLatitude()
  latitud!: number;

/**
 * Referencia a la foto ya subida a temporales, devuelta por
 * `POST /reportes/fotos` como `fotoTemp`. Debe existir en la
 * carpeta temporal en el momento de crear el reporte.
 */
  @ApiProperty({
    description:
      'Referencias fotoTemp devueltas por POST /reportes/fotos. La primera corresponde a la portada y la segunda a la evidencia.',
    example: [
      'a3f1c2a0-4e9d-4a7a-9c2e-1f8a6d2b7e10.jpg',
      'b4f2d3b1-5f8e-4b8c-8d3f-2a9b7e1c6f20.jpg',
    ],
    type: [String],
    minItems: 2,
    maxItems: 2,
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  fotoTemps!: string[];


  /** FK hacia `fuente.id`. Debe existir en el catálogo de fuentes. */
  @ApiProperty({ example: 1 })
  @IsInt()
  fuenteId!: number;

  /** FK hacia `tipo_propiedad.id`. Debe existir en el catálogo. */
  @ApiProperty({ example: 1 })
  @IsInt()
  tipoPropiedadId!: number;

  /** FK hacia `tipo_fraude.id`. Debe existir en el catálogo. */
  @ApiProperty({ example: 1 })
  @IsInt()
  tipoFraudeId!: number;
}
