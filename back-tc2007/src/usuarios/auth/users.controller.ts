import { Body, Controller, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SuperAdminGuard } from './super-admin.guard';
import { AuthService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    console.log('DTO RECIBIDO:', dto);
    return this.service.register(dto);
  }

  @Post('register-admin')
    registerAdmin(@Body() dto: RegisterDto) {
      return this.service.registerAdmin(dto);
  }

  @Get('pending-admins')
  @UseGuards(AuthGuard, SuperAdminGuard)
  getPendingAdmins() {
    return this.service.getPendingAdmins();
  }

  @Patch('admins/:id/approve')
  @UseGuards(AuthGuard, SuperAdminGuard)
  approveAdmin(@Param('id') id: string) {
    return this.service.approveAdmin(id);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Post('admin-login')
  @HttpCode(200)
  adminLogin(@Body() dto: LoginDto) {
    return this.service.adminLogin(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.service.refresh(dto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: { correo: string }) {
    return this.service.forgotPassword(dto.correo);
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto);
  }
}