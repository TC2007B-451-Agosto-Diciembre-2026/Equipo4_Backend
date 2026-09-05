import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './users.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}