import { Injectable, NotFoundException } from '@nestjs/common';
import { UsuariosRepository } from './usuarios.repository';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
//import { generateSalt, hashPassword } from '../common/password.util';
import { UpdateMyProfileDto } from './dto/update-profile.dto';
import { generateSalt } from '../common/password.util';
import { hash } from './auth/users.service';
@Injectable()
export class UsuariosService {
  constructor(private readonly repository: UsuariosRepository) {}

  async create(data: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    const salt = generateSalt();
    const usuario = await this.repository.save({
      correo: data.correo,
      //contrasena: hashPassword(data.contrasena, salt),
      contrasena: hash(data.contrasena + salt),
      salt: salt,
      nombre: data.nombre,
      rolId: data.rolId,
    });
    return UsuarioResponseDto.fromEntity(usuario);
  }

  async findAll(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.repository.findAll();
    return usuarios.map((u) => UsuarioResponseDto.fromEntity(u));
  }

  async findOne(id: string): Promise<UsuarioResponseDto> {
    const usuario = await this.repository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return UsuarioResponseDto.fromEntity(usuario);
  }

  async update(id: string, changes: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    const existe = await this.repository.findById(id);
    if (!existe) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    const cambios:any = { ...changes };
    const actualizado = await this.repository.update(id, cambios as any);
    return UsuarioResponseDto.fromEntity(actualizado!);
  }

  async findMe(id: string): Promise<UsuarioResponseDto> {
    return this.findOne(id);
  }

  async updateMe( id: string, changes: UpdateMyProfileDto): Promise<UsuarioResponseDto> {
    return this.update(id, changes);
  }

  async remove(id: string): Promise<void> {
    const borrado = await this.repository.softDelete(id);
    if (!borrado) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
  }
}