import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // 3 = Super Admin
    if (req.user?.rolId !== 3) {
      throw new ForbiddenException('Solo el Super Admin puede realizar esta acción');
    }

    return true;
  }
}