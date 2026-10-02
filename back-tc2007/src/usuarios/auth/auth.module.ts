import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './users.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './users.service';
import { UsersRepository } from './users.repository';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, AuthGuard, AdminGuard],
  exports: [AuthGuard],
})
export class AuthModule {}