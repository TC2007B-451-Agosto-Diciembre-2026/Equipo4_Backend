import { Module } from '@nestjs/common';
import { AuthModule } from '../usuarios/auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { FuentesController } from './fuentes.controller';
import { FuentesRepository } from './fuentes.repository';
import { FuentesService } from './fuentes.service';

/** Módulo del catálogo de fuentes. */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [FuentesController],
  providers: [FuentesService, FuentesRepository],
})
export class FuentesModule {}
