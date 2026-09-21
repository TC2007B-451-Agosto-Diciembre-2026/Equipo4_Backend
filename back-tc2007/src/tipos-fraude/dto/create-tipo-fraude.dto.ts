import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** Datos para crear un tipo de fraude vía `POST /tipos-fraude`. */
export class CreateTipoFraudeDto {
  /** Nombre del tipo de fraude, debe ser único. */
  @ApiProperty({ example: 'Propiedad inexistente' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
