import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from './jwt';

/**
 * Exige un access token válido en el header
 * `Authorization: Bearer <token>`.
 *
 * Es el primer guard de cualquier ruta protegida: valida el token con
 * {@link verify} y deja sus claims en `req.user`, de donde los leen
 * {@link CurrentUser}, {@link AdminGuard} y {@link SuperAdminGuard}.
 * Por eso esos guards deben declararse después de este:
 * `@UseGuards(AuthGuard, SuperAdminGuard)`.
 *
 * Responde 401 (no autenticado), a diferencia de los guards de rol,
 * que responden 403 (autenticado pero sin permiso).
 *
 * No consulta la base de datos: un usuario dado de baja o con el rol
 * cambiado sigue entrando mientras su token sea válido. Y como
 * {@link AuthService.refresh} emite access tokens nuevos sin consultar
 * la base, ese acceso puede extenderse hasta que expire el refresh
 * token (7 días).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * Rechaza el token si no es de tipo `access`. Esto impide usar un
   * refresh token (que dura 7 días en vez de 15 minutos) para entrar a
   * rutas protegidas.
   *
   * El prefijo `Bearer ` se compara distinguiendo mayúsculas, así que
   * un cliente que envíe `bearer ` será rechazado.
   *
   * @throws UnauthorizedException si falta el header, no tiene el
   * prefijo `Bearer `, o el token es inválido, expiró o no es de
   * tipo `access`.
   */
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: string = req.headers.authorization ?? '';

    if (!header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token');
    }

    const payload = verify(header.slice('Bearer '.length));

    if (!payload || payload.type !== 'access') {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    req.user = payload;
    return true;
  }
}