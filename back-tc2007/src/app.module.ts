import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { FuentesModule } from './fuentes/fuentes.module';
import { EstadosModule } from './estados/estados.module';
import { TiposPropiedadModule } from './tipos-propiedad/tipos-propiedad.module';
import { TiposFraudeModule } from './tipos-fraude/tipos-fraude.module';
import { ReportesModule } from './reportes/reportes.module';

/**
 * Módulo raíz. Agrupa el módulo de usuarios/autenticación (`UsuariosModule`,
 * que internamente monta `AuthModule`) y los módulos de catálogo y de
 * negocio del sistema de reporte de fraudes.
 */
@Module({
  imports: [
    UsuariosModule,
    RolesModule,
    FuentesModule,
    EstadosModule,
    TiposPropiedadModule,
    TiposFraudeModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
