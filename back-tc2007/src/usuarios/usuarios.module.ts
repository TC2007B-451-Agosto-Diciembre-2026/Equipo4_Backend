import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { UsuariosController } from './usuarios.controller';
import { UsuariosRepository } from './usuarios.repository';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuariosRepository],
})
export class UsuariosModule {}