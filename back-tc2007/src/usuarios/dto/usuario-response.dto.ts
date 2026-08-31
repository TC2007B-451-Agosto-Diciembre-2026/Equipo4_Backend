import { Usuario } from '../entities/usuario.entity';

export class UsuarioResponseDto {
  id!: number;
  correo!: string;
  nombre!: string;
  rolId!: number;
  createdAt!: string;

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
