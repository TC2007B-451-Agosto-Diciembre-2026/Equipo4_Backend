import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string | undefined;

  @IsString()
  @MinLength(8)
  password: string | undefined;

  @IsString()
  @MinLength(2)
  nombre: string | undefined;
}