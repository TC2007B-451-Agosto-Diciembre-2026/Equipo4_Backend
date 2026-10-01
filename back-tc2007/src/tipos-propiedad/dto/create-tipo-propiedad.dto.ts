import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** Datos para crear un tipo de propiedad vía `POST /tipos-propiedad`. */
export class CreateTipoPropiedadDto {
  /** Nombre del tipo de propiedad, debe ser único. */
  @ApiProperty({ example: 'Departamento' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
