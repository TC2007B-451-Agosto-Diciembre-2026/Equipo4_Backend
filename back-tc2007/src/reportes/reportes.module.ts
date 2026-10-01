import { Module } from '@nestjs/common';
import { AuthModule } from '../usuarios/auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ReportesController } from './reportes.controller';
import { ReportesRepository } from './reportes.repository';
import { ReportesService } from './reportes.service';

/** Módulo de reportes de fraude, la entidad central del sistema. */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ReportesController],
  providers: [ReportesService, ReportesRepository],
})
export class ReportesModule {}
