import { Injectable, NotFoundException } from '@nestjs/common';
import { FuentesRepository } from './fuentes.repository';
import { FuenteResponseDto } from './dto/fuente-response.dto';
import { CreateFuenteDto } from './dto/create-fuente.dto';
import { UpdateFuenteDto } from './dto/update-fuente.dto';

/** Lógica de negocio del CRUD de fuentes. Traduce ausencia de fila a {@link NotFoundException}. */
@Injectable()
export class FuentesService {
  constructor(private readonly repository: FuentesRepository) {}

  /** Crea una fuente nueva. */
  async create(data: CreateFuenteDto): Promise<FuenteResponseDto> {
    const fuente = await this.repository.save(data);
    return FuenteResponseDto.fromEntity(fuente);
  }

  /** Lista todas las fuentes. */
  async findAll(): Promise<FuenteResponseDto[]> {
    const fuentes = await this.repository.findAll();
    return fuentes.map((f) => FuenteResponseDto.fromEntity(f));
  }

  /**
   * Busca una fuente por id.
   * @throws NotFoundException si no existe.
   */
  async findOne(id: number): Promise<FuenteResponseDto> {
    const fuente = await this.repository.findById(id);
    if (!fuente) {
      throw new NotFoundException(`Fuente ${id} no encontrada`);
    }
    return FuenteResponseDto.fromEntity(fuente);
  }

  /**
   * Actualiza campos parciales de una fuente.
   * @throws NotFoundException si no existe.
   */
  async update(
    id: number,
    changes: UpdateFuenteDto,
  ): Promise<FuenteResponseDto> {
    const existe = await this.repository.findById(id);
    if (!existe) {
      throw new NotFoundException(`Fuente ${id} no encontrada`);
    }
    const actualizado = await this.repository.update(id, changes);
    return FuenteResponseDto.fromEntity(actualizado!);
  }

  /**
   * Elimina una fuente físicamente.
   * @throws NotFoundException si no existe.
   * @throws ConflictException (propagado desde el repository) si algún
   * reporte todavía la referencia.
   */
  async remove(id: number): Promise<void> {
    const borrado = await this.repository.remove(id);
    if (!borrado) {
      throw new NotFoundException(`Fuente ${id} no encontrada`);
    }
  }
}
