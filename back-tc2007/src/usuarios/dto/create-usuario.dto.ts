import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * Datos requeridos para crear un usuario vía `POST /usuarios`.
 *
 * Este endpoint lo usa un administrador para dar de alta cuentas
 * (por ejemplo, otros administradores); el alta de un usuario final
 * ocurre por `POST /auth/register`, que tiene su propio DTO.
 */
export class CreateUsuarioDto {
  /** Correo electrónico único; se usará como identificador de login. */
  @ApiProperty({ example: 'ara@tec.mx' })
  @IsEmail()
  correo!: string;

  /** Contraseña en texto plano; el servicio la hashea antes de guardar. */
  @ApiProperty({ example: 'contrasena123', minLength: 10})
  @IsString()
  @MinLength(10, { message: 'la contraseña debe tener al menos 10 caracteres' })
  contrasena!: string;

  /** Nombre para mostrar del usuario. */
  @ApiProperty({ example: 'Ara Vázquez' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  /** FK hacia `rol.id`. Debe existir en la tabla `rol`. */
  @ApiProperty({ example: 1 })
  @IsInt()
  rolId!: number;
}
