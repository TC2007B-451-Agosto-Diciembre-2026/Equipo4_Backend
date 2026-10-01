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
import { RolesService } from './roles.service';
import { RolResponseDto } from './dto/rol-response.dto';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

/** CRUD del catálogo de roles (`/roles`). Requiere Bearer token. */
@ApiTags('roles')
@ApiBearerAuth('access-token')
@Controller('roles')
@UseGuards(AuthGuard)
export class RolesController {
  constructor(private readonly service: RolesService) {}

  /** Crea un rol. */
  @ApiOperation({ summary: 'Crear un rol' })
  @ApiOkResponse({ type: RolResponseDto })
  @Post()
  create(@Body() dto: CreateRolDto): Promise<RolResponseDto> {
    return this.service.create(dto);
  }

  /** Lista todos los roles. */
  @ApiOperation({ summary: 'Listar roles' })
  @ApiOkResponse({ type: RolResponseDto, isArray: true })
  @Get()
  findAll(): Promise<RolResponseDto[]> {
    return this.service.findAll();
  }

  /** Obtiene un rol por id. 404 si no existe. */
  @ApiOperation({ summary: 'Obtener un rol por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: RolResponseDto })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RolResponseDto> {
    return this.service.findOne(id);
  }

  /** Actualiza parcialmente un rol. */
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: RolResponseDto })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolDto,
  ): Promise<RolResponseDto> {
    return this.service.update(id, dto);
  }

  /** Elimina un rol físicamente. 409 si algún usuario lo tiene asignado. */
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
