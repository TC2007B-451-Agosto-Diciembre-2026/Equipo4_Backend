import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

/**
 * Body de `POST /auth/reset-password`. Segundo paso de la recuperación:
 * el usuario manda el código que recibió por correo (vía
 * `POST /auth/forgot-password`) junto con su nueva contraseña. El código
 * es temporal y expira.
 */
export class ResetPasswordDto {
  @ApiProperty({ example: 'ara@tec.mx', description: 'Correo de la cuenta a recuperar' })
  @IsEmail()
  correo!: string;

  @ApiProperty({ example: '483920', description: 'Código de verificación enviado por correo' })
  @IsString()
  codigo!: string;

  /** Misma política que en el registro (ver {@link RegisterDto}). */
  @ApiProperty({
    example: 'NuevaContrasena#2026',
    minLength: 10,
    description:
      'Mín. 10 caracteres, con mayúscula, minúscula, número y símbolo; sin 3 caracteres iguales consecutivos',
  })
  @IsString()
  @MinLength(10)
  // ... tus @Matches se quedan igual
  nuevaContrasena!: string;
}