import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { existsSync, renameSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { ReportesRepository } from './reportes.repository';
import { ReporteResponseDto } from './dto/reporte-response.dto';
import { FotoTempResponseDto } from './dto/foto-temp-response.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { FOTOS_REPORTES_DIR, FOTOS_TMP_DIR } from './uploads.paths';

/**
 * Lógica de negocio del CRUD de reportes. Traduce ausencia de fila a
 * {@link NotFoundException}; las validaciones de FK (fuente, estado,
 * tipo de propiedad, tipo de fraude) las hace {@link ReportesRepository}.
 */
@Injectable()
export class ReportesService {
  constructor(private readonly repository: ReportesRepository) {}

  /**
   * Registra una foto recién subida por `POST /reportes/fotos`
   * (multipart, ya guardada en `FOTOS_TMP_DIR` por `FileInterceptor`)
   * y devuelve la referencia (`fotoTemp`) que hay que mandar luego en
   * `POST /reportes`, más una URL pública para previsualizarla.
   * @throws BadRequestException si no se mandó ningún archivo.
   */
  registrarFotoTemporal(file: Express.Multer.File): FotoTempResponseDto {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo (campo "foto")');
    }
    const dto = new FotoTempResponseDto();
    dto.fotoTemp = file.filename;
    dto.url = `/uploads/tmp/${file.filename}`;
    return dto;
  }

  /**
   * Crea un reporte nuevo a nombre de `usuarioId` (viene del token,
   * ver `ReportesController.create`). El estado inicial ("Pendiente")
   * lo asigna el repository, no se recibe aquí. La foto referenciada
   * por `data.fotoTemp` se mueve de temporales a almacenamiento
   * definitivo como parte de la creación (ver {@link moverFotoAPermanente}).
   */
  async create(
    usuarioId: string,
    data: CreateReporteDto,
  ): Promise<ReporteResponseDto> {
    const foto = this.moverFotoAPermanente(data.fotoTemp);
    const reporte = await this.repository.save({
      nombre: data.nombre,
      descripcion: data.descripcion,
      longitud: data.longitud,
      latitud: data.latitud,
      foto,
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

  /** Lista los reportes activos de un usuario específico. Usado por `GET /reportes/self`. */
  async findByUsuario(usuarioId: string): Promise<ReporteResponseDto[]> {
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
    // `fotoTemp` no es una columna real (ver CreateReporteDto): si viene,
    // se traduce a `foto` moviendo el archivo de temporales a definitivo,
    // igual que en `create`.
    const { fotoTemp, ...resto } = changes;
    const cambios: Partial<UpdateReporteDto> & { foto?: string } = resto;
    if (fotoTemp) {
      cambios.foto = this.moverFotoAPermanente(fotoTemp);
    }
    const actualizado = await this.repository.update(id, cambios as any);
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

  /**
   * Mueve una foto de `FOTOS_TMP_DIR` a `FOTOS_REPORTES_DIR`,
   * renombrándola con un UUID nuevo, y devuelve la ruta pública
   * resultante (ej. `/uploads/reportes/<uuid>.jpg`).
   *
   * `fotoTemp` viene del body (cliente), así que se sanea con
   * `basename` antes de construir la ruta de origen: evita que un
   * valor como `../../etc/passwd` escape de `FOTOS_TMP_DIR`
   * (path traversal).
   *
   * @throws BadRequestException si el archivo temporal no existe
   * (nunca se subió, ya se movió antes, o expiró).
   */
  private moverFotoAPermanente(fotoTemp: string): string {
    const nombreTemp = basename(fotoTemp);
    const origen = join(FOTOS_TMP_DIR, nombreTemp);

    if (!existsSync(origen)) {
      throw new BadRequestException(
        'fotoTemp no encontrado; sube la foto de nuevo con POST /reportes/fotos',
      );
    }

    const nombreFinal = `${randomUUID()}${extname(nombreTemp)}`;
    const destino = join(FOTOS_REPORTES_DIR, nombreFinal);
    renameSync(origen, destino);

    return `/uploads/reportes/${nombreFinal}`;
  }
}