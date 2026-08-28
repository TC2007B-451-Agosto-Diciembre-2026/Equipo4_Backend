import {Usuario} from '../entities/usuario.entity';

export class UsuarioResponseDto {
  correo!: string;
  nombre!: string;
  createdAt!: Date;


static fromEntity(usuario: Usuario): UsuarioResponseDto {
  const dto = new UsuarioResponseDto();
  dto.correo = usuario.correo;
  dto.nombre = usuario.nombre;
  dto.createdAt = usuario.createdAt;
  return dto;
}
}

