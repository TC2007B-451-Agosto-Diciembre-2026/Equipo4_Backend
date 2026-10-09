import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

/**
 * Body de `POST /auth/register` (usuario final) y `POST /auth/register-admin`
 * (solicitud de administrador; queda en rol "Pendiente" hasta que un
 * super admin la apruebe).
 */
export class RegisterDto {
  @ApiProperty({ example: 'ara@tec.mx', description: 'Correo único; no puede estar registrado' })
  @IsEmail()
  email: string | undefined;

  /**
   * Política de contraseña: mínimo 10 caracteres, al menos una mayúscula,
   * una minúscula, un número y un símbolo, sin tres caracteres iguales
   * seguidos.
   */
  @ApiProperty({
    example: 'Contrasena#2026',
    minLength: 10,
    description:
      'Mín. 10 caracteres, con mayúscula, minúscula, número y símbolo; sin 3 caracteres iguales consecutivos',
  })
  @IsString()
  @MinLength(10)
  // ... tus @Matches se quedan igual
  password: string | undefined;

  @ApiProperty({ example: 'Ara Vázquez', minLength: 2, description: 'Nombre visible del usuario' })
  @IsString()
  @MinLength(2)
  nombre: string | undefined;
}