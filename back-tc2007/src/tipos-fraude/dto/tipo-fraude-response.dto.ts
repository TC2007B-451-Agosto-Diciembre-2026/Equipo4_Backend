import { ApiProperty } from '@nestjs/swagger';
import { TipoFraude } from '../entities/tipo-fraude.entity';

/** Forma pública de un tipo de fraude devuelta por la API. */
export class TipoFraudeResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Propiedad inexistente' })
  nombre!: string;

  /** Construye el DTO de respuesta a partir de la entidad de dominio. */
  static fromEntity(tipo: TipoFraude): TipoFraudeResponseDto {
    const dto = new TipoFraudeResponseDto();
    dto.id = tipo.id;
    dto.nombre = tipo.nombre;
    return dto;
  }
}
