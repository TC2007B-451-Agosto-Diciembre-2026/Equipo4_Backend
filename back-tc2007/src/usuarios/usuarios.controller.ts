import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
import { AuthGuard } from './auth/auth.guard';
import { CurrentUser } from './auth/current-user.decorator';
import type { JwtPayload } from './auth/jwt';
import { UsuariosService } from './usuarios.service';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

/**
 * CRUD administrativo de usuarios (`/usuarios`).
 *
 * Distinto de `/auth`: aquí se gestionan cuentas ya existentes
 * (alta manual, edición, baja lógica); el registro público de un
 * usuario final ocurre en `POST /auth/register`. Todas las rutas
 * requieren un Bearer token válido (ver {@link AuthGuard}).
 */
@ApiTags('usuarios')
@ApiBearerAuth('access-token')
@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  /**
   * Crea un usuario. El campo `user` (extraído del token vía
   * {@link CurrentUser}) queda disponible por si en el futuro se
   * necesita auditar quién dio de alta la cuenta; hoy no se usa en
   * la lógica de creación.
   */
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    return this.service.create(dto);
  }

  /** Lista todos los usuarios activos (excluye los borrados lógicamente). */
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiOkResponse({ type: UsuarioResponseDto, isArray: true })
  @Get()
  findAll(): Promise<UsuarioResponseDto[]> {
    return this.service.findAll();
  }

  /** Obtiene un usuario por id. 404 si no existe o está borrado. */
  @ApiOperation({ summary: 'Obtener un usuario por id' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del usuario' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UsuarioResponseDto> {
    return this.service.findOne(id);
  }

  /**
   * Actualiza parcialmente un usuario. Si se manda `contrasena`, el
   * servicio genera un nuevo salt y rehashea antes de guardar.
   */
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del usuario' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    return this.service.update(id, dto);
  }

  /** Borra lógicamente un usuario (`deleted_at = NOW()`). */
  @ApiOperation({ summary: 'Eliminar un usuario (borrado lógico)' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del usuario' })
  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}