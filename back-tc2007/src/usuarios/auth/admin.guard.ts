import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (req.user?.rolId !== 2) {
      throw new ForbiddenException('Solo los administradores pueden realizar esta acción');
    }

    return true;
  }
}