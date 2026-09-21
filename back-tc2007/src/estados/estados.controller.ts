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
import { EstadosService } from './estados.service';
import { EstadoResponseDto } from './dto/estado-response.dto';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

/** CRUD del catálogo de estados (`/estados`). Requiere Bearer token. */
@ApiTags('estados')
@ApiBearerAuth('access-token')
@Controller('estados')
@UseGuards(AuthGuard)
export class EstadosController {
  constructor(private readonly service: EstadosService) {}

  /** Crea un estado. */
  @ApiOperation({ summary: 'Crear un estado' })
  @ApiOkResponse({ type: EstadoResponseDto })
  @Post()
  create(@Body() dto: CreateEstadoDto): Promise<EstadoResponseDto> {
    return this.service.create(dto);
  }

  /** Lista todos los estados. */
  @ApiOperation({ summary: 'Listar estados' })
  @ApiOkResponse({ type: EstadoResponseDto, isArray: true })
  @Get()
  findAll(): Promise<EstadoResponseDto[]> {
    return this.service.findAll();
  }

  /** Obtiene un estado por id. 404 si no existe. */
  @ApiOperation({ summary: 'Obtener un estado por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: EstadoResponseDto })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EstadoResponseDto> {
    return this.service.findOne(id);
  }

  /** Actualiza parcialmente un estado. */
  @ApiOperation({ summary: 'Actualizar un estado' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: EstadoResponseDto })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoDto,
  ): Promise<EstadoResponseDto> {
    return this.service.update(id, dto);
  }

  /** Elimina un estado físicamente. 409 si algún reporte lo usa. */
  @ApiOperation({ summary: 'Eliminar un estado' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}