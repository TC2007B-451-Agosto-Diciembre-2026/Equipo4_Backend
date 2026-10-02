import { Injectable, NotFoundException } from '@nestjs/common';
import { TiposPropiedadRepository } from './tipos-propiedad.repository';
import { TipoPropiedadResponseDto } from './dto/tipo-propiedad-response.dto';
import { CreateTipoPropiedadDto } from './dto/create-tipo-propiedad.dto';
import { UpdateTipoPropiedadDto } from './dto/update-tipo-propiedad.dto';

/** Lógica de negocio del CRUD de tipos de propiedad. Traduce ausencia de fila a {@link NotFoundException}. */
@Injectable()
export class TiposPropiedadService {
  constructor(private readonly repository: TiposPropiedadRepository) {}

  /** Crea un tipo de propiedad nuevo. */
  async create(
    data: CreateTipoPropiedadDto,
  ): Promise<TipoPropiedadResponseDto> {
    const tipo = await this.repository.save(data);
    return TipoPropiedadResponseDto.fromEntity(tipo);
  }

  /** Lista todos los tipos de propiedad. */
  async findAll(): Promise<TipoPropiedadResponseDto[]> {
    const tipos = await this.repository.findAll();
    return tipos.map((t) => TipoPropiedadResponseDto.fromEntity(t));
  }

  /**
   * Busca un tipo de propiedad por id.
   * @throws NotFoundException si no existe.
   */
  async findOne(id: number): Promise<TipoPropiedadResponseDto> {
    const tipo = await this.repository.findById(id);
    if (!tipo) {
      throw new NotFoundException(`Tipo de propiedad ${id} no encontrado`);
    }
    return TipoPropiedadResponseDto.fromEntity(tipo);
  }

  /**
   * Actualiza el nombre de un tipo de propiedad.
   * @throws NotFoundException si no existe.
   */
  async update(
    id: number,
    changes: UpdateTipoPropiedadDto,
  ): Promise<TipoPropiedadResponseDto> {
    const existe = await this.repository.findById(id);
    if (!existe) {
      throw new NotFoundException(`Tipo de propiedad ${id} no encontrado`);
    }
    const actualizado = await this.repository.update(id, changes);
    return TipoPropiedadResponseDto.fromEntity(actualizado!);
  }

  /**
   * Elimina un tipo de propiedad físicamente.
   * @throws NotFoundException si no existe.
   * @throws ConflictException (propagado desde el repository) si algún
   * reporte todavía lo referencia.
   */
  async remove(id: number): Promise<void> {
    const borrado = await this.repository.remove(id);
    if (!borrado) {
      throw new NotFoundException(`Tipo de propiedad ${id} no encontrado`);
    }
  }
}