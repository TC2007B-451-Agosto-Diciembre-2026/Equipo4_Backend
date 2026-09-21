import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** Datos para crear un estado vía `POST /estados`. */
export class CreateEstadoDto {
  /** Nombre del estado, debe ser único. */
  @ApiProperty({ example: 'En revisión' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
