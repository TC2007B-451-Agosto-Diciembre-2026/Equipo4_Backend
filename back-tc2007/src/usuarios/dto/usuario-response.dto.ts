import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../entities/usuario.entity';

/**
 * Forma pública de un usuario devuelta por la API.
 *
 * Deliberadamente omite `contrasena` y `salt`: nunca deben salir de
 * la capa de servicio/repositorio hacia el cliente HTTP.
 */
export class UsuarioResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'ara@tec.mx' })
  correo!: string;

  @ApiProperty({ example: 'Ara Vázquez' })
  nombre!: string;

  @ApiProperty({ example: 1, description: 'FK hacia rol.id' })
  rolId!: number;

  @ApiProperty({ example: '2026-09-21T17:00:00.000Z' })
  createdAt!: string;

  /**
   * Construye el DTO de respuesta a partir de la entidad de dominio,
   * filtrando los campos sensibles (`contrasena`, `salt`).
   */
  static fromEntity(usuario: Usuario): UsuarioResponseDto {
    const dto = new UsuarioResponseDto();
    dto.id = usuario.id;
    dto.correo = usuario.correo;
    dto.nombre = usuario.nombre;
    dto.rolId = usuario.rolId;
    dto.createdAt = usuario.createdAt.toISOString();
    return dto;
  }
}
