import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';


/**
 * Body de `POST /auth/login` (app móvil) y `POST /auth/admin-login`
 * (dashboard). La contraseña se compara contra el hash + salt guardados
 * en BD; nunca se almacena en texto plano.
 */
export class LoginDto {
  @ApiProperty({ example: 'ara@tec.mx', description: 'Correo registrado del usuario' })
  @IsEmail()
  email: string | undefined;

  @ApiProperty({ example: 'Contrasena#2026', description: 'Contraseña en texto plano (viaja solo por HTTPS)' })
  @IsString()
  password: string | undefined;
}