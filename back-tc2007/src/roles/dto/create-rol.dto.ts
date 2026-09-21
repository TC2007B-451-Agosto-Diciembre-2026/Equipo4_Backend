import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** Datos para crear un rol vía `POST /roles`. */
export class CreateRolDto {
  /** Nombre para mostrar, debe ser único. */
  @ApiProperty({ example: 'Administrador' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  /** Slug corto único (ej. "admin"). */
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  alias!: string;
}
