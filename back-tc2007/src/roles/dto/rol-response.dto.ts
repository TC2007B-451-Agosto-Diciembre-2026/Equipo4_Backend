import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../entities/rol.entity';

/** Forma pública de un rol devuelta por la API. */
export class RolResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Administrador' })
  nombre!: string;

  @ApiProperty({ example: 'admin' })
  alias!: string;

  /** Construye el DTO de respuesta a partir de la entidad de dominio. */
  static fromEntity(rol: Rol): RolResponseDto {
    const dto = new RolResponseDto();
    dto.id = rol.id;
    dto.nombre = rol.nombre;
    dto.alias = rol.alias;
    return dto;
  }
}
