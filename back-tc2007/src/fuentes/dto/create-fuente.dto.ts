import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** Datos para crear una fuente vía `POST /fuentes`. */
export class CreateFuenteDto {
  /** Categoría de la fuente. */
  @ApiProperty({ example: 'Plataforma' })
  @IsString()
  @IsNotEmpty()
  tipoFuente!: string;

  /** Valor específico dentro de la categoría. */
  @ApiProperty({ example: 'Airbnb' })
  @IsString()
  @IsNotEmpty()
  valorFuente!: string;
}
