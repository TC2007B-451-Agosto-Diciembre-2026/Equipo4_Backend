import { Module } from '@nestjs/common';
import { AuthModule } from '../usuarios/auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { TiposPropiedadController } from './tipos-propiedad.controller';
import { TiposPropiedadRepository } from './tipos-propiedad.repository';
import { TiposPropiedadService } from './tipos-propiedad.service';

/** Módulo del catálogo de tipos de propiedad. */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TiposPropiedadController],
  providers: [TiposPropiedadService, TiposPropiedadRepository],
})
export class TiposPropiedadModule {}
