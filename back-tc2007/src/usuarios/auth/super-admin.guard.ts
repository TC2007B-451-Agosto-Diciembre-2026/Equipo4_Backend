import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * Restringe una ruta al rol de super administrador (`rolId = 3`).
 *
 * No valida el token por sí mismo: depende de que {@link AuthGuard}
 * se haya ejecutado antes y dejado el payload del JWT en `req.user`.
 * Por eso siempre debe declararse después de él:
 * `@UseGuards(AuthGuard, SuperAdminGuard)`. Si se usa solo, `req.user`
 * no existe y toda petición es rechazada.
 *
 * El rol se toma de los claims del token, no de la base de datos, así
 * que un cambio de rol no se refleja hasta que el usuario obtiene un
 * token nuevo (ver {@link AuthService.refresh}).
 *
 * Se usa en `GET /auth/pending-admins` y
 * `PATCH /auth/admins/:id/approve`.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  /**
   * Lanza `ForbiddenException` (403) en lugar de devolver `false`
   * para que el cliente reciba un mensaje explicativo; devolver
   * `false` también produce un 403, pero con el mensaje genérico de
   * Nest.
   *
   * @throws ForbiddenException si el usuario no es super administrador.
   */
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // 3 = Super Admin
    if (req.user?.rolId !== 3) {
      throw new ForbiddenException('Solo el Super Admin puede realizar esta acción');
    }

    return true;
  }
}