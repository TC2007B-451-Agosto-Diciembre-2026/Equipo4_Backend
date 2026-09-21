import { Injectable, NotFoundException } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { RolResponseDto } from './dto/rol-response.dto';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

/** Lógica de negocio del CRUD de roles. Traduce ausencia de fila a {@link NotFoundException}. */
@Injectable()
export class RolesService {
  constructor(private readonly repository: RolesRepository) {}

  /** Crea un rol nuevo. */
  async create(data: CreateRolDto): Promise<RolResponseDto> {
    const rol = await this.repository.save(data);
    return RolResponseDto.fromEntity(rol);
  }

  /** Lista todos los roles. */
  async findAll(): Promise<RolResponseDto[]> {
    const roles = await this.repository.findAll();
    return roles.map((r) => RolResponseDto.fromEntity(r));
  }

  /**
   * Busca un rol por id.
   * @throws NotFoundException si no existe.
   */
  async findOne(id: number): Promise<RolResponseDto> {
    const rol = await this.repository.findById(id);
    if (!rol) {
      throw new NotFoundException(`Rol ${id} no encontrado`);
    }
    return RolResponseDto.fromEntity(rol);
  }

  /**
   * Actualiza campos parciales de un rol.
   * @throws NotFoundException si no existe.
   */
  async update(id: number, changes: UpdateRolDto): Promise<RolResponseDto> {
    const existe = await this.repository.findById(id);
    if (!existe) {
      throw new NotFoundException(`Rol ${id} no encontrado`);
    }
    const actualizado = await this.repository.update(id, changes);
    return RolResponseDto.fromEntity(actualizado!);
  }

  /**
   * Elimina un rol físicamente.
   * @throws NotFoundException si no existe.
   * @throws ConflictException (propagado desde el repository) si algún
   * usuario todavía tiene este rol asignado.
   */
  async remove(id: number): Promise<void> {
    const borrado = await this.repository.remove(id);
    if (!borrado) {
      throw new NotFoundException(`Rol ${id} no encontrado`);
    }
  }
}
