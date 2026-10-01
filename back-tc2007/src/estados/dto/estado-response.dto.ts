import { ApiProperty } from '@nestjs/swagger';
import { Estado } from '../entities/estado.entity';

/** Forma pública de un estado devuelta por la API. */
export class EstadoResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Pendiente' })
  nombre!: string;

  /** Construye el DTO de respuesta a partir de la entidad de dominio. */
  static fromEntity(estado: Estado): EstadoResponseDto {
    const dto = new EstadoResponseDto();
    dto.id = estado.id;
    dto.nombre = estado.nombre;
    return dto;
  }
}
