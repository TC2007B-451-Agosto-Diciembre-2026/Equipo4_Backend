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
import { TiposPropiedadService } from './tipos-propiedad.service';
import { TipoPropiedadResponseDto } from './dto/tipo-propiedad-response.dto';
import { CreateTipoPropiedadDto } from './dto/create-tipo-propiedad.dto';
import { UpdateTipoPropiedadDto } from './dto/update-tipo-propiedad.dto';

/** CRUD del catálogo de tipos de propiedad (`/tipos-propiedad`). Requiere Bearer token. */
@ApiTags('tipos-propiedad')
@ApiBearerAuth('access-token')
@Controller('tipos-propiedad')
@UseGuards(AuthGuard)
export class TiposPropiedadController {
  constructor(private readonly service: TiposPropiedadService) {}

  /** Crea un tipo de propiedad. */
  @ApiOperation({ summary: 'Crear un tipo de propiedad' })
  @ApiOkResponse({ type: TipoPropiedadResponseDto })
  @Post()
  create(
    @Body() dto: CreateTipoPropiedadDto,
  ): Promise<TipoPropiedadResponseDto> {
    return this.service.create(dto);
  }

  /** Lista todos los tipos de propiedad. */
  @ApiOperation({ summary: 'Listar tipos de propiedad' })
  @ApiOkResponse({ type: TipoPropiedadResponseDto, isArray: true })
  @Get()
  findAll(): Promise<TipoPropiedadResponseDto[]> {
    return this.service.findAll();
  }

  /** Obtiene un tipo de propiedad por id. 404 si no existe. */
  @ApiOperation({ summary: 'Obtener un tipo de propiedad por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: TipoPropiedadResponseDto })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TipoPropiedadResponseDto> {
    return this.service.findOne(id);
  }

  /** Actualiza parcialmente un tipo de propiedad. */
  @ApiOperation({ summary: 'Actualizar un tipo de propiedad' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: TipoPropiedadResponseDto })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoPropiedadDto,
  ): Promise<TipoPropiedadResponseDto> {
    return this.service.update(id, dto);
  }

  /** Elimina un tipo de propiedad físicamente. 409 si algún reporte lo usa. */
  @ApiOperation({ summary: 'Eliminar un tipo de propiedad' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
