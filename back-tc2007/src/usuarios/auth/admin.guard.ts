import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * Restringe una ruta a administradores: `rolId` 2 (Admin) o
 * 3 (Super Admin). Es el mismo criterio que usa
 * {@link AuthService.adminLogin} para dejar entrar al dashboard.
 *
 * Igual que {@link SuperAdminGuard}, no valida el token: depende de
 * que {@link AuthGuard} se haya ejecutado antes y dejado el payload en
 * `req.user`, así que debe declararse después de él:
 * `@UseGuards(AuthGuard, AdminGuard)`.
 *
 * El rol se toma de los claims del token, no de la base de datos, así
 * que un cambio de rol no se refleja hasta que el usuario obtiene un
 * token nuevo.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  /**
   * @throws ForbiddenException (403) si el usuario no es Admin ni
   * Super Admin.
   */
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // 1 = User
    // 2 = Admin
    // 3 = Super Admin
    // 4 = Pending
    if (req.user?.rolId !== 2 && req.user?.rolId !== 3) {
      throw new ForbiddenException('Solo los administradores pueden realizar esta acción');
    }

    return true;
  }
}