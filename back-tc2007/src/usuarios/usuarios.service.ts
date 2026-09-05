import { Injectable, NotFoundException } from '@nestjs/common';
import { UsuariosRepository } from './usuarios.repository';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { hashPassword } from '../common/password.util';

@Injectable()
export class UsuariosService {
  constructor(private readonly repository: UsuariosRepository) {}

  async create(userId: string, data: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    const usuario = await this.repository.save(userId, {
      correo: data.correo,
      contrasena: hashPassword(data.contrasena),
      nombre: data.nombre,
      rolId: data.rolId,
    });
    return UsuarioResponseDto.fromEntity(usuario);
  }

  async findAll(userId: string): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.repository.findById(id);
    if (!usuarios) {
      throw new NotFoundException('Usuario ' + id + ' no encontrado');
    }
    return usuarios.map((u) => UsuarioResponseDto.fromEntity(u));
  }

  async findOne(id: number): Promise<UsuarioResponseDto> {
    const usuario = await this.repository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return UsuarioResponseDto.fromEntity(usuario);
  }

  async update(
    id: number,
    changes: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    const existe = await this.repository.findById(id);
    if (!existe) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    const cambios = { ...changes };
    if (cambios.contrasena) {
      cambios.contrasena = hashPassword(cambios.contrasena);
    }
    const actualizado = await this.repository.update(id, cambios as any);
    return UsuarioResponseDto.fromEntity(actualizado!);
  }

  async remove(id: number): Promise<void> {
    const borrado = await this.repository.softDelete(id);
    if (!borrado) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
  }
}