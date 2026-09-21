import { Module } from '@nestjs/common';
import { AuthModule } from '../usuarios/auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { TiposFraudeController } from './tipos-fraude.controller';
import { TiposFraudeRepository } from './tipos-fraude.repository';
import { TiposFraudeService } from './tipos-fraude.service';

/** Módulo del catálogo de tipos de fraude. */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TiposFraudeController],
  providers: [TiposFraudeService, TiposFraudeRepository],
})
export class TiposFraudeModule {}
