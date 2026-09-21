import { Module } from '@nestjs/common';
import { AuthModule } from '../usuarios/auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { RolesController } from './roles.controller';
import { RolesRepository } from './roles.repository';
import { RolesService } from './roles.service';

/** Módulo del catálogo de roles. */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
})
export class RolesModule {}
