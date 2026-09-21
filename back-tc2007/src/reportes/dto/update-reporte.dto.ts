import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { CreateReporteDto } from './create-reporte.dto';

/**
 * Datos para actualizar un reporte vía `PATCH /reportes/:id`.
 *
 * Todos los campos de {@link CreateReporteDto} se vuelven opcionales.
 * `estadoId` se agrega aparte (no vive en `CreateReporteDto`) porque
 * solo tiene sentido al actualizar: mover un reporte ya existente de
 * "Pendiente" a "En revisión", "Verificado", etc.
 */
export class UpdateReporteDto extends PartialType(CreateReporteDto) {
  /** FK hacia `estado.id`. Cambia el estado del reporte (ej. de "Pendiente" a "En revisión"). */
  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  estadoId?: number;
}
