import { Injectable, NotFoundException } from '@nestjs/common';
import { TiposFraudeRepository } from './tipos-fraude.repository';
import { TipoFraudeResponseDto } from './dto/tipo-fraude-response.dto';
import { CreateTipoFraudeDto } from './dto/create-tipo-fraude.dto';
import { UpdateTipoFraudeDto } from './dto/update-tipo-fraude.dto';

/** Lógica de negocio del CRUD de tipos de fraude. Traduce ausencia de fila a {@link NotFoundException}. */
@Injectable()
export class TiposFraudeService {
  constructor(private readonly repository: TiposFraudeRepository) {}

  /** Crea un tipo de fraude nuevo. */
  async create(data: CreateTipoFraudeDto): Promise<TipoFraudeResponseDto> {
    const tipo = await this.repository.save(data);
    return TipoFraudeResponseDto.fromEntity(tipo);
  }

  /** Lista todos los tipos de fraude. */
  async findAll(): Promise<TipoFraudeResponseDto[]> {
    const tipos = await this.repository.findAll();
    return tipos.map((t) => TipoFraudeResponseDto.fromEntity(t));
  }

  /**
   * Busca un tipo de fraude por id.
   * @throws NotFoundException si no existe.
   */
  async findOne(id: number): Promise<TipoFraudeResponseDto> {
    const tipo = await this.repository.findById(id);
    if (!tipo) {
      throw new NotFoundException(`Tipo de fraude ${id} no encontrado`);
    }
    return TipoFraudeResponseDto.fromEntity(tipo);
  }

  /**
   * Actualiza el nombre de un tipo de fraude.
   * @throws NotFoundException si no existe.
   */
  async update(
    id: number,
    changes: UpdateTipoFraudeDto,
  ): Promise<TipoFraudeResponseDto> {
    const existe = await this.repository.findById(id);
    if (!existe) {
      throw new NotFoundException(`Tipo de fraude ${id} no encontrado`);
    }
    const actualizado = await this.repository.update(id, changes);
    return TipoFraudeResponseDto.fromEntity(actualizado!);
  }

  /**
   * Elimina un tipo de fraude físicamente.
   * @throws NotFoundException si no existe.
   * @throws ConflictException (propagado desde el repository) si algún
   * reporte todavía lo referencia.
   */
  async remove(id: number): Promise<void> {
    const borrado = await this.repository.remove(id);
    if (!borrado) {
      throw new NotFoundException(`Tipo de fraude ${id} no encontrado`);
    }
  }
}
