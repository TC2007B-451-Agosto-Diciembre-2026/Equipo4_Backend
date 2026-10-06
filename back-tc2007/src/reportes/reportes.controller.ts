import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../usuarios/auth/auth.guard';
import { CurrentUser } from '../usuarios/auth/current-user.decorator';
import type { JwtPayload } from '../usuarios/auth/jwt';
import { ReportesService } from './reportes.service';
import { ReporteResponseDto } from './dto/reporte-response.dto';
import { FotoTempResponseDto } from './dto/foto-temp-response.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { FOTOS_TMP_DIR } from './uploads.paths';

/**
 * CRUD de reportes de fraude (`/reportes`). Requiere Bearer token.
 *
 * `findAll`/`findOne` devuelven reportes de cualquier usuario (no
 * hay filtro por dueño a nivel de controller); `create` siempre
 * asocia el reporte al usuario autenticado.
 */
@ApiTags('reportes')
@ApiBearerAuth('access-token')
@Controller('reportes')
@UseGuards(AuthGuard)
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  /**
   * Sube una foto de evidencia a una carpeta temporal, ANTES de crear
   * el reporte (paso 1 del flujo). Devuelve `fotoTemp`, que hay que
   * mandar en el body de `POST /reportes` (paso 2) para que la foto
   * se asocie al reporte y se mueva a almacenamiento definitivo.
   *
   * La foto queda públicamente visible de inmediato en `url`
   * (`/uploads/tmp/<archivo>`), servida como estático desde `main.ts`.
   */
  @ApiOperation({
    summary: 'Subir una foto de evidencia (paso previo a crear el reporte)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties:
      {fotos:
        {type: 'array', items:
          {type: 'string',format: 'binary'}, minItems: 2, maxItems: 2,
        },
      },
    required: ['fotos'],
    },
  })
  
  @ApiOkResponse({
    type: FotoTempResponseDto,
    isArray: true,
  })
  @Post('fotos')
  @UseInterceptors(
    FilesInterceptor('fotos', 2, {
      storage: diskStorage({
        destination: FOTOS_TMP_DIR,
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFotos(
    @UploadedFiles() files: Express.Multer.File[],
  ): FotoTempResponseDto[] {
    return this.service.registrarFotoTemporal(files);
  }

  /**
   * Crea un reporte a nombre del usuario autenticado. `usuarioId` se
   * toma de `user.sub` (payload del JWT vía {@link CurrentUser}), no
   * del body: así un usuario no puede reportar a nombre de otro.
   * El reporte nace en estado "Pendiente" automáticamente. La foto
   * (`dto.fotoTemp`, obtenida de `POST /reportes/fotos`) se mueve a
   * almacenamiento definitivo como parte de la creación.
   */
  @ApiOperation({ summary: 'Crear un reporte' })
  @ApiOkResponse({ type: ReporteResponseDto })
  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReporteDto,
  ): Promise<ReporteResponseDto> {
    return this.service.create(user.sub, dto);
  }

  /** Lista todos los reportes activos (de todos los usuarios). */
  @ApiOperation({ summary: 'Listar reportes' })
  @ApiOkResponse({ type: ReporteResponseDto, isArray: true })
  @Get()
  findAll(): Promise<ReporteResponseDto[]> {
    return this.service.findAll();
  }

  /**
   * Lista los reportes del usuario autenticado (`user.sub`, del JWT).
   * Debe declararse antes de `GET /reportes/:id` — si no, Nest
   * interpretaría "self" como si fuera un `id` y esta ruta nunca se
   * alcanzaría.
   */
  @ApiOperation({ summary: 'Listar mis reportes (usuario autenticado)' })
  @ApiOkResponse({ type: ReporteResponseDto, isArray: true })
  @Get('self')
  findSelf(@CurrentUser() user: JwtPayload): Promise<ReporteResponseDto[]> {
    return this.service.findByUsuario(user.sub);
  }

  /** Obtiene un reporte por id. 404 si no existe o está borrado. */
  @ApiOperation({ summary: 'Obtener un reporte por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ReporteResponseDto })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReporteResponseDto> {
    return this.service.findOne(id);
  }

  @Get('filter')
  filter(
    @Query('estadoId') estadoId?: string,
    @Query('fuenteId') fuenteId?: string,
    @Query('tipoPropiedadId') tipoPropiedadId?: string,
    @Query('tipoFraudeId') tipoFraudeId?: string,
  ): Promise<ReporteResponseDto[]> {
    return this.service.filter({
      estadoId: estadoId ? Number(estadoId) : undefined,
      fuenteId: fuenteId ? Number(fuenteId) : undefined,
      tipoPropiedadId: tipoPropiedadId
        ? Number(tipoPropiedadId)
        : undefined,
      tipoFraudeId: tipoFraudeId ? Number(tipoFraudeId) : undefined,
    });
  }

  /**
   * Actualiza parcialmente un reporte. Incluir `estadoId` en el body
   * es la forma de mover un reporte de "Pendiente" a otro estado
   * (ej. "En revisión", "Verificado").
   */
  @ApiOperation({ summary: 'Actualizar un reporte' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ReporteResponseDto })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReporteDto,
  ): Promise<ReporteResponseDto> {
    return this.service.update(id, dto);
  }

  /** Borra lógicamente un reporte (`deleted_at = NOW()`). */
  @ApiOperation({ summary: 'Eliminar un reporte (borrado lógico)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}