import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Body de `POST /auth/refresh`. Se manda el refresh token (dura 7 días)
 * obtenido en el login para recibir un nuevo access token (dura 15 min)
 * sin volver a pedir credenciales.
 */
export class RefreshDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token devuelto por /auth/login o /auth/admin-login',
  })
  @IsString()
  refreshToken: string | undefined;
}