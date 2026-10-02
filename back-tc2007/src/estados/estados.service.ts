import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadosRepository } from './estados.repository';
import { EstadoResponseDto } from './dto/estado-response.dto';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

/** Lógica de negocio del CRUD de estados. Traduce ausencia de fila a {@link NotFoundException}. */
@Injectable()
export class EstadosService {
  constructor(private readonly repository: EstadosRepository) {}

  /** Crea un estado nuevo. */
  async create(data: CreateEstadoDto): Promise<EstadoResponseDto> {
    const estado = await this.repository.save(data);
    return EstadoResponseDto.fromEntity(estado);
  }

  /** Lista todos los estados. */
  async findAll(): Promise<EstadoResponseDto[]> {
    const estados = await this.repository.findAll();
    return estados.map((e) => EstadoResponseDto.fromEntity(e));
  }

  /**
   * Busca un estado por id.
   * @throws NotFoundException si no existe.
   */
  async findOne(id: number): Promise<EstadoResponseDto> {
    const estado = await this.repository.findById(id);
    if (!estado) {
      throw new NotFoundException(`Estado ${id} no encontrado`);
    }
    return EstadoResponseDto.fromEntity(estado);
  }

  /**
   * Actualiza el nombre de un estado.
   * @throws NotFoundException si no existe.
   */
  async update(
    id: number,
    changes: UpdateEstadoDto,
  ): Promise<EstadoResponseDto> {
    const existe = await this.repository.findById(id);
    if (!existe) {
      throw new NotFoundException(`Estado ${id} no encontrado`);
    }
    const actualizado = await this.repository.update(id, changes);
    return EstadoResponseDto.fromEntity(actualizado!);
  }

  /**
   * Elimina un estado físicamente.
   * @throws NotFoundException si no existe.
   * @throws ConflictException (propagado desde el repository) si algún
   * reporte todavía lo referencia.
   */
  async remove(id: number): Promise<void> {
    const borrado = await this.repository.remove(id);
    if (!borrado) {
      throw new NotFoundException(`Estado ${id} no encontrado`);
    }
  }
}