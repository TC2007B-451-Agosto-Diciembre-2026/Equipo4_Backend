import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { hashPassword, verifyPassword } from '../common/password.util';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { sign, verify } from './jwt';
import { UsersRepository } from './users.repository';

const ACCESS_TTL = 15 * 60; // 15 minutos
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 días

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersRepository) {}

  async register(dto: RegisterDto): Promise<{ id: number; email: string }> {
    if (await this.users.findByEmail(dto.email!)) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = await this.users.save(
            dto.email!,
            hashPassword(dto.password!),
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

    if (!verifyPassword(dto.password!, user.passwordHash!)) {
      throw new UnauthorizedException('Password incorrecto');
    }

    const claims = { sub: user.id!, email: user.email! };

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
        type: 'access',
      },
      ACCESS_TTL,
    );

    return { accessToken };
  }
}