import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Datos para actualizar un usuario vía `PATCH /usuarios/:id`.
 *
 * Todos los campos de {@link CreateUsuarioDto} se vuelven opcionales;
 * solo se actualizan las columnas presentes en el body. Si se manda
 * `contrasena`, el servicio genera un nuevo salt y la vuelve a hashear.
 */
export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'ara@tec.mx' })
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiPropertyOptional({ example: 'Ara Vázquez' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  rolId?: number;
}