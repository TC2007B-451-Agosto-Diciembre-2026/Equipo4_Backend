import { ApiProperty } from '@nestjs/swagger';

/** Respuesta de `POST /auth/register`. No incluye tokens: hay que hacer login aparte. */
export class RegisterResponseDto {
  @ApiProperty({ example: 'b3f1c2a0-4e9d-4a7a-9c2e-1f8a6d2b7e10' })
  id!: string;

  @ApiProperty({ example: 'ara@tec.mx' })
  email!: string;
}