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
import { TiposFraudeService } from './tipos-fraude.service';
import { TipoFraudeResponseDto } from './dto/tipo-fraude-response.dto';
import { CreateTipoFraudeDto } from './dto/create-tipo-fraude.dto';
import { UpdateTipoFraudeDto } from './dto/update-tipo-fraude.dto';

/** CRUD del catálogo de tipos de fraude (`/tipos-fraude`). Requiere Bearer token. */
@ApiTags('tipos-fraude')
@ApiBearerAuth('access-token')
@Controller('tipos-fraude')
@UseGuards(AuthGuard)
export class TiposFraudeController {
  constructor(private readonly service: TiposFraudeService) {}

  /** Crea un tipo de fraude. */
  @ApiOperation({ summary: 'Crear un tipo de fraude' })
  @ApiOkResponse({ type: TipoFraudeResponseDto })
  @Post()
  create(@Body() dto: CreateTipoFraudeDto): Promise<TipoFraudeResponseDto> {
    return this.service.create(dto);
  }

  /** Lista todos los tipos de fraude. */
  @ApiOperation({ summary: 'Listar tipos de fraude' })
  @ApiOkResponse({ type: TipoFraudeResponseDto, isArray: true })
  @Get()
  findAll(): Promise<TipoFraudeResponseDto[]> {
    return this.service.findAll();
  }

  /** Obtiene un tipo de fraude por id. 404 si no existe. */
  @ApiOperation({ summary: 'Obtener un tipo de fraude por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: TipoFraudeResponseDto })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TipoFraudeResponseDto> {
    return this.service.findOne(id);
  }

  /** Actualiza parcialmente un tipo de fraude. */
  @ApiOperation({ summary: 'Actualizar un tipo de fraude' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: TipoFraudeResponseDto })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoFraudeDto,
  ): Promise<TipoFraudeResponseDto> {
    return this.service.update(id, dto);
  }

  /** Elimina un tipo de fraude físicamente. 409 si algún reporte lo usa. */
  @ApiOperation({ summary: 'Eliminar un tipo de fraude' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
