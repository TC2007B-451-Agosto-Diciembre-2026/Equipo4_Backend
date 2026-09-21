import { ApiProperty } from '@nestjs/swagger';
import { Fuente } from '../entities/fuente.entity';

/** Forma pública de una fuente devuelta por la API. */
export class FuenteResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Plataforma' })
  tipoFuente!: string;

  @ApiProperty({ example: 'Airbnb' })
  valorFuente!: string;

  /** Construye el DTO de respuesta a partir de la entidad de dominio. */
  static fromEntity(fuente: Fuente): FuenteResponseDto {
    const dto = new FuenteResponseDto();
    dto.id = fuente.id;
    dto.tipoFuente = fuente.tipoFuente;
    dto.valorFuente = fuente.valorFuente;
    return dto;
  }
}
