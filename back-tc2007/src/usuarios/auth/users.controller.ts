import { Body, Controller, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { SuperAdminGuard } from './super-admin.guard';
import { AuthService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

/**
 * Autenticación y alta de cuentas (`/auth`).
 *
 * Distinto de `/usuarios`: aquí ocurre el registro público, el inicio
 * de sesión, la renovación de tokens y la recuperación de contraseña.
 * La mayoría de las rutas son públicas porque se usan antes de tener
 * un token; las únicas protegidas son las de gestión de solicitudes de
 * administrador, que exigen un Bearer token válido ({@link AuthGuard})
 * y rol de super administrador ({@link SuperAdminGuard}).
 *
 * Existen dos flujos paralelos: el de usuario final (`register` /
 * `login`) y el de administrador (`register-admin` / `admin-login`).
 * Un administrador recién registrado queda pendiente hasta que un
 * super administrador lo aprueba en `PATCH /auth/admins/:id/approve`.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  /**
   * Registro público de un usuario final. No requiere token.
   */
  @ApiOperation({ summary: 'Registrar un usuario final' })
  @ApiCreatedResponse({ description: 'Usuario creado correctamente.' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    console.log('DTO RECIBIDO:', dto);
    return this.service.register(dto);
  }

  /**
   * Solicitud de registro como administrador. La ruta es pública,
   * pero la cuenta queda en estado pendiente: no puede usar
   * `POST /auth/admin-login` hasta que un super administrador la
   * apruebe. Reutiliza {@link RegisterDto} del registro normal.
   */
  @ApiOperation({ summary: 'Solicitar registro como administrador' })
  @ApiCreatedResponse({ description: 'Solicitud creada; pendiente de aprobación.' })
  @Post('register-admin')
  registerAdmin(@Body() dto: RegisterDto) {
    return this.service.registerAdmin(dto);
  }

  /**
   * Lista las solicitudes de administrador que aún no han sido
   * aprobadas. Solo accesible para super administradores.
   */
  @ApiOperation({ summary: 'Listar administradores pendientes de aprobación' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Lista de administradores pendientes.' })
  @Get('pending-admins')
  @UseGuards(AuthGuard, SuperAdminGuard)
  getPendingAdmins() {
    return this.service.getPendingAdmins();
  }

  /**
   * Aprueba la solicitud de un administrador pendiente, habilitándolo
   * para iniciar sesión en el flujo de administración. Solo accesible
   * para super administradores.
   */
  @ApiOperation({ summary: 'Aprobar un administrador pendiente' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID del administrador a aprobar' })
  @ApiOkResponse({ description: 'Administrador aprobado.' })
  @Patch('admins/:id/approve')
  @UseGuards(AuthGuard, SuperAdminGuard)
  approveAdmin(@Param('id') id: string) {
    return this.service.approveAdmin(id);
  }

  /**
   * Inicio de sesión de usuario final. Responde `200` (en lugar del
   * `201` por defecto de un `POST`) porque no crea ningún recurso.
   */
  @ApiOperation({ summary: 'Iniciar sesión (usuario final)' })
  @ApiOkResponse({ description: 'Credenciales válidas; devuelve los tokens de sesión.' })
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  /**
   * Inicio de sesión del panel de administración. Usa el mismo
   * {@link LoginDto} que el login normal, pero el servicio valida
   * además que la cuenta sea de administrador y esté aprobada.
   */
  @ApiOperation({ summary: 'Iniciar sesión (administrador)' })
  @ApiOkResponse({ description: 'Credenciales válidas; devuelve los tokens de sesión.' })
  @Post('admin-login')
  @HttpCode(200)
  adminLogin(@Body() dto: LoginDto) {
    return this.service.adminLogin(dto);
  }

  /**
   * Intercambia un refresh token vigente por un nuevo access token,
   * para que el cliente renueve la sesión sin volver a pedir
   * credenciales.
   */
  @ApiOperation({ summary: 'Renovar el access token' })
  @ApiOkResponse({ description: 'Devuelve un nuevo access token.' })
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.service.refresh(dto);
  }

  /**
   * Inicia la recuperación de contraseña para el correo indicado.
   *
   * El body está tipado en línea (`{ correo: string }`) en vez de con
   * un DTO de clase, por lo que no pasa por class-validator ni aparece
   * descrito en Swagger salvo por el `@ApiBody` de abajo.
   */
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { correo: { type: 'string', format: 'email' } },
      required: ['correo'],
    },
  })
  @ApiOkResponse({ description: 'Solicitud procesada.' })
  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: { correo: string }) {
    return this.service.forgotPassword(dto.correo);
  }

  /**
   * Establece una nueva contraseña usando el token de recuperación
   * generado en `POST /auth/forgot-password`.
   */
  @ApiOperation({ summary: 'Restablecer contraseña' })
  @ApiOkResponse({ description: 'Contraseña actualizada.' })
  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto);
  }
}