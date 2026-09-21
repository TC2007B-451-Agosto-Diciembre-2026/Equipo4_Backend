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
import { FuentesService } from './fuentes.service';
import { FuenteResponseDto } from './dto/fuente-response.dto';
import { CreateFuenteDto } from './dto/create-fuente.dto';
import { UpdateFuenteDto } from './dto/update-fuente.dto';

/** CRUD del catálogo de fuentes (`/fuentes`). Requiere Bearer token. */
@ApiTags('fuentes')
@ApiBearerAuth('access-token')
@Controller('fuentes')
@UseGuards(AuthGuard)
export class FuentesController {
  constructor(private readonly service: FuentesService) {}

  /** Crea una fuente. */
  @ApiOperation({ summary: 'Crear una fuente' })
  @ApiOkResponse({ type: FuenteResponseDto })
  @Post()
  create(@Body() dto: CreateFuenteDto): Promise<FuenteResponseDto> {
    return this.service.create(dto);
  }

  /** Lista todas las fuentes. */
  @ApiOperation({ summary: 'Listar fuentes' })
  @ApiOkResponse({ type: FuenteResponseDto, isArray: true })
  @Get()
  findAll(): Promise<FuenteResponseDto[]> {
    return this.service.findAll();
  }

  /** Obtiene una fuente por id. 404 si no existe. */
  @ApiOperation({ summary: 'Obtener una fuente por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: FuenteResponseDto })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FuenteResponseDto> {
    return this.service.findOne(id);
  }

  /** Actualiza parcialmente una fuente. */
  @ApiOperation({ summary: 'Actualizar una fuente' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: FuenteResponseDto })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFuenteDto,
  ): Promise<FuenteResponseDto> {
    return this.service.update(id, dto);
  }

  /** Elimina una fuente físicamente. 409 si algún reporte la usa. */
  @ApiOperation({ summary: 'Eliminar una fuente' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
