import { ApiProperty } from '@nestjs/swagger';
import { Reporte } from '../entities/reporte.entity';

/** Forma pública de un reporte devuelta por la API. */
export class ReporteResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Departamento fantasma en Polanco' })
  nombre!: string;

  @ApiProperty({
    example: 'El anfitrión pidió depósito fuera de la plataforma y desapareció.',
  })
  descripcion!: string;

  @ApiProperty({ example: -99.1332 })
  longitud!: number;

  @ApiProperty({ example: 19.4326 })
  latitud!: number;

@ApiProperty({
  description: 'URL pública de la foto de evidencia',
  example: '/uploads/reportes/a3f1c2a0-4e9d-4a7a-9c2e-1f8a6d2b7e10.jpg',
})

@ApiProperty({
  description: 'URL pública de la imagen de portada',
  example: '/uploads/reportes/portada.jpg',
})
portadaUrl!: string;

@ApiProperty({
  description: 'URL pública de la imagen de evidencia',
  example: '/uploads/reportes/evidencia.jpg',
})
evidenciaUrl!: string;

@ApiProperty({
  example: 'b3f1c2a0-4e9d-4a7a-9c2e-1f8a6d2b7e10',
  description: 'FK hacia usuario.id (quien reportó)',
})
usuarioId!: string;

  @ApiProperty({ example: 1, description: 'FK hacia fuente.id' })
  fuenteId!: number;

  @ApiProperty({ example: 1, description: 'FK hacia estado.id' })
  estadoId!: number;

  @ApiProperty({ example: 1, description: 'FK hacia tipo_propiedad.id' })
  tipoPropiedadId!: number;

  @ApiProperty({ example: 1, description: 'FK hacia tipo_fraude.id' })
  tipoFraudeId!: number;

  @ApiProperty({ example: '2026-09-21T17:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: null, nullable: true })
  updatedAt!: string | null;

  /**
   * Construye el DTO de respuesta a partir de la entidad de dominio.
   * Convierte `createdAt`/`updatedAt` (Date) a ISO string.
   */
  static fromEntity(reporte: Reporte): ReporteResponseDto {
    const dto = new ReporteResponseDto();
    dto.id = reporte.id;
    dto.nombre = reporte.nombre;
    dto.descripcion = reporte.descripcion;
    dto.longitud = reporte.longitud;
    dto.latitud = reporte.latitud;
    dto.portadaUrl = reporte.portada;
    dto.evidenciaUrl = reporte.evidencia;
    dto.usuarioId = reporte.usuarioId;
    dto.fuenteId = reporte.fuenteId;
    dto.estadoId = reporte.estadoId;
    dto.tipoPropiedadId = reporte.tipoPropiedadId;
    dto.tipoFraudeId = reporte.tipoFraudeId;
    dto.createdAt = reporte.createdAt.toISOString();
    dto.updatedAt = reporte.updatedAt
      ? reporte.updatedAt.toISOString()
      : null;
    return dto;
  }
}
