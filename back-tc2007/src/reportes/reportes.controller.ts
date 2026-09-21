import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';

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
   * Crea un reporte a nombre del usuario autenticado. `usuarioId` se
   * toma de `user.sub` (payload del JWT vía {@link CurrentUser}), no
   * del body: así un usuario no puede reportar a nombre de otro.
   * El reporte nace en estado "Pendiente" automáticamente.
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
