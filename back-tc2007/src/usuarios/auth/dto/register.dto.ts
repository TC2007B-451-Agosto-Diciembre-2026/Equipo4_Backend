import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string | undefined;

  @IsString()
  @MinLength(10)
  @Matches(/[A-Z]/, {message: 'La contraseña debe contener al menos una mayúscula',})
  @Matches(/[a-z]/, {message: 'La contraseña debe contener al menos una minúscula',})
  @Matches(/[0-9]/, {message: 'La contraseña debe contener al menos un número'})
  @Matches(/[^A-Za-z0-9]/, {message: 'La contraseña debe contener al menos un símbolo',})
  @Matches(/^(?!.*(.)\1\1)/, {message: 'La contraseña no puede tener tres caracteres iguales consecutivos',})
  password: string | undefined;

  @IsString()
  @MinLength(2)
  nombre: string | undefined;
}