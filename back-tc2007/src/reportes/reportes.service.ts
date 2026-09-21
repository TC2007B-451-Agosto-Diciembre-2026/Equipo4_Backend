import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportesRepository } from './reportes.repository';
import { ReporteResponseDto } from './dto/reporte-response.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';

/**
 * Lógica de negocio del CRUD de reportes. Traduce ausencia de fila a
 * {@link NotFoundException}; las validaciones de FK (fuente, estado,
 * tipo de propiedad, tipo de fraude) las hace {@link ReportesRepository}.
 */
@Injectable()
export class ReportesService {
  constructor(private readonly repository: ReportesRepository) {}

  /**
   * Crea un reporte nuevo a nombre de `usuarioId` (viene del token,
   * ver `ReportesController.create`). El estado inicial ("Pendiente")
   * lo asigna el repository, no se recibe aquí.
   */
  async create(
    usuarioId: number,
    data: CreateReporteDto,
  ): Promise<ReporteResponseDto> {
    const reporte = await this.repository.save({
      nombre: data.nombre,
      descripcion: data.descripcion,
      longitud: data.longitud,
      latitud: data.latitud,
      imgB64: data.imgB64,
      usuarioId,
      fuenteId: data.fuenteId,
      tipoPropiedadId: data.tipoPropiedadId,
      tipoFraudeId: data.tipoFraudeId,
    });
    return ReporteResponseDto.fromEntity(reporte);
  }

  /** Lista todos los reportes activos. */
  async findAll(): Promise<ReporteResponseDto[]> {
    const reportes = await this.repository.findAll();
    return reportes.map((r) => ReporteResponseDto.fromEntity(r));
  }

  /**
   * Lista los reportes activos de un usuario específico.
   *
   * Nota de documentación: este método no está expuesto todavía por
   * `ReportesController` (no hay una ruta como
   * `GET /reportes/mios` o `GET /usuarios/:id/reportes` que lo
   * llame); queda disponible para cuando se agregue esa ruta.
   */
  async findByUsuario(usuarioId: number): Promise<ReporteResponseDto[]> {
    const reportes = await this.repository.findByUsuario(usuarioId);
    return reportes.map((r) => ReporteResponseDto.fromEntity(r));
  }

  /**
   * Busca un reporte por id.
   * @throws NotFoundException si no existe o está borrado.
   */
  async findOne(id: number): Promise<ReporteResponseDto> {
    const reporte = await this.repository.findById(id);
    if (!reporte) {
      throw new NotFoundException(`Reporte ${id} no encontrado`);
    }
    return ReporteResponseDto.fromEntity(reporte);
  }

  /**
   * Actualiza campos parciales de un reporte, incluyendo `estadoId`
   * (así es como un administrador mueve un reporte de "Pendiente" a
   * otro estado).
   * @throws NotFoundException si el reporte no existe.
   */
  async update(
    id: number,
    changes: UpdateReporteDto,
  ): Promise<ReporteResponseDto> {
    const existe = await this.repository.findById(id);
    if (!existe) {
      throw new NotFoundException(`Reporte ${id} no encontrado`);
    }
    const actualizado = await this.repository.update(id, changes);
    return ReporteResponseDto.fromEntity(actualizado!);
  }

  /**
   * Borra lógicamente un reporte (`deleted_at = NOW()`).
   * @throws NotFoundException si no existe o ya estaba borrado.
   */
  async remove(id: number): Promise<void> {
    const borrado = await this.repository.softDelete(id);
    if (!borrado) {
      throw new NotFoundException(`Reporte ${id} no encontrado`);
    }
  }
}
