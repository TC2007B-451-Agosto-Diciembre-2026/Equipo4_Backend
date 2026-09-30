import { ApiPropertyOptional } from '@nestjs/swagger';
import {IsEmail, IsOptional, IsString, MinLength, Matches} from 'class-validator';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({ example: 'Paquito Gomez' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombre?: string;

  @ApiPropertyOptional({ example: 'paquito@mail.com' })
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiPropertyOptional({ example: 'newchampeon123', minLength: 10 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @Matches(/[A-Z]/, {message: 'La contraseña debe contener al menos una mayúscula',})
  @Matches(/[a-z]/, {message: 'La contraseña debe contener al menos una minúscula',})
  @Matches(/[0-9]/, {message: 'La contraseña debe contener al menos un número'})
  @Matches(/[^A-Za-z0-9]/, {message: 'La contraseña debe contener al menos un símbolo',})
  @Matches(/^(?!.*(.)\1\1)/, {message: 'La contraseña no puede tener tres caracteres iguales consecutivos',})
  contrasena?: string;
}