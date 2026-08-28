import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail()
  correo!: string;

  @IsString()
  @MinLength(8, { message: 'la contraseña debe tener al menos 8 caracteres' })
  contrasena!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsInt()
  rolId!: number;
}