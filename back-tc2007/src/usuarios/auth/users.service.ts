import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { generateSalt, hashPassword, verifyPassword } from '../../common/password.util';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { sign, verify } from './jwt';
import { UsersRepository } from './users.repository';
import { randomInt } from 'node:crypto';
import * as nodemailer from 'nodemailer';
import { ResetPasswordDto } from './dto/reset-password.dto';

const ACCESS_TTL = 15 * 60; // 15 minutos
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 días

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersRepository) {}

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  async register(dto: RegisterDto): Promise<{ id: string; email: string }> {
    if (await this.users.findByEmail(dto.email!)) {
      throw new ConflictException('El email ya está registrado');
    }
    const salt = generateSalt();
    const user = await this.users.save(
            dto.email!,
            hashPassword(dto.password!, salt),
            salt,
            dto.nombre!,
        );
    return { id: user.id!, email: user.email! };
  }

  async registerAdmin(dto: RegisterDto,): Promise<{ id: string; email: string }> {
    if (await this.users.findByEmail(dto.email!)) {
      throw new ConflictException('El email ya está registrado');
    }
    const salt = generateSalt();
    const user = await this.users.saveAdmin(
      dto.email!,
      hashPassword(dto.password!, salt),
      salt,
      dto.nombre!,
    );

    return { id: user.id!, email: user.email! };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.users.findByEmail(dto.email!);

    if (!user) {
      throw new UnauthorizedException('El usuario no existe');
    }

    if (!verifyPassword(dto.password!, user.salt!, user.passwordHash!)) {
      throw new UnauthorizedException('Password incorrecto');
    }

    const claims = { sub: user.id!, email: user.email!, rolId: user.rolId!};

    const accessToken = sign(
      { ...claims, type: 'access' },
      ACCESS_TTL,
    );

    const refreshToken = sign(
      { ...claims, type: 'refresh' },
      REFRESH_TTL,
    );

    console.log('Login de ' + user.email + ': ' + accessToken);

    return { accessToken, refreshToken };
  }

  refresh(dto: RefreshDto): { accessToken: string } {
    const payload = verify(dto.refreshToken!);

    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const accessToken = sign(
      {
        sub: payload.sub,
        email: payload.email,
        rolId: payload.rolId,
        type: 'access',
      },
      ACCESS_TTL,
    );

    return { accessToken };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('El usuario no existe');
    }
    const caracteres = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
      codigo += caracteres[randomInt(caracteres.length)];
    }
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000);
    await this.users.createRecoveryCode(user.id!, codigo, expiraEn);
    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Código de recuperación - Ofraud Stay',
      text: `Tu código de recuperación es: ${codigo}
    Este código es válido por 15 minutos y solo puede usarse una vez.`,
    });
    console.log('Código de recuperación:', codigo);
    console.log('Expira en:', expiraEn);
    return {
      message: 'Se generó el código de recuperación',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.users.findByEmail(dto.correo);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const recovery = await this.users.findRecoveryCode(
      user.id!,
      dto.codigo,
    );
    if (!recovery) {
      throw new UnauthorizedException('Código inválido');
    }
    if (new Date() > recovery.expira_en) {
      throw new UnauthorizedException('Código expirado');
    }
    const salt = generateSalt();
    const passwordHash = hashPassword(dto.nuevaContrasena, salt);
    await this.users.updatePassword(
      user.id!,
      passwordHash,
      salt,
    );
    await this.users.useRecoveryCode(recovery.id);
    return {
      message: 'Contraseña actualizada correctamente',
    };
  }
}