import { Module } from '@nestjs/common';
import { AuthModule } from '../usuarios/auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { EstadosController } from './estados.controller';
import { EstadosRepository } from './estados.repository';
import { EstadosService } from './estados.service';

/** Módulo del catálogo de estados. */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [EstadosController],
  providers: [EstadosService, EstadosRepository],
})
export class EstadosModule {}
