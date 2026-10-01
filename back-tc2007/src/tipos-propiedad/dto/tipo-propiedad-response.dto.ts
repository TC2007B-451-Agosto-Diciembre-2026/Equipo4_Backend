import { ApiProperty } from '@nestjs/swagger';
import { TipoPropiedad } from '../entities/tipo-propiedad.entity';

/** Forma pública de un tipo de propiedad devuelta por la API. */
export class TipoPropiedadResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Departamento' })
  nombre!: string;

  /** Construye el DTO de respuesta a partir de la entidad de dominio. */
  static fromEntity(tipo: TipoPropiedad): TipoPropiedadResponseDto {
    const dto = new TipoPropiedadResponseDto();
    dto.id = tipo.id;
    dto.nombre = tipo.nombre;
    return dto;
  }
}
