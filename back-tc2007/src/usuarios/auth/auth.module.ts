import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './users.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './users.service';
import { UsersRepository } from './users.repository';
import { AdminGuard } from './admin.guard';
import { SuperAdminGuard } from './super-admin.guard';

/**
 * Módulo de autenticación: agrupa las rutas de `/auth`, la lógica de
 * login/registro y los guards de autorización.
 *
 * - **imports**: {@link DatabaseModule} aporta el pool de MySQL
 *   (`DB_POOL`) que necesita {@link UsersRepository}.
 * - **providers**: {@link AuthService} y {@link UsersRepository} son
 *   internos; no se exportan, así que ningún otro módulo puede emitir
 *   tokens ni tocar contraseñas por su cuenta.
 * - **exports**: solo los guards ({@link AuthGuard}, {@link AdminGuard},
 *   {@link SuperAdminGuard}), para que otros módulos que importen
 *   `AuthModule` (como el de `/usuarios`) puedan proteger sus rutas.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, AuthGuard, AdminGuard, SuperAdminGuard],
  exports: [AuthGuard, AdminGuard, SuperAdminGuard],
})
export class AuthModule {}