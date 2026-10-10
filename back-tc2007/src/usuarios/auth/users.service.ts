import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
//import { generateSalt, hashPassword, verifyPassword } from '../../common/password.util';
import { createHash, randomInt } from 'node:crypto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { sign, verify } from './jwt';
import { UsersRepository } from './users.repository';
import * as nodemailer from 'nodemailer';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { generateSalt } from '../../common/password.util';

/**
 * Para generar un salt aleatorio de 16 bytes y codificarlo en base64.
 */
export function hash(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/** Vida del access token: 15 minutos (en segundos). */
const ACCESS_TTL = 15 * 60;
/** Vida del refresh token: 7 días (en segundos). */
const REFRESH_TTL = 7 * 24 * 60 * 60;

/**
 * Lógica de autenticación detrás de {@link AuthController}.
 *
 * Maneja el alta de cuentas, el inicio de sesión con emisión de JWT
 * (access + refresh), la aprobación de administradores y la
 * recuperación de contraseña por código enviado al correo.
 *
 * Las contraseñas nunca se guardan en claro: cada cuenta tiene su
 * propio `salt` y se almacena solo el hash (ver `password.util`).
 *
 * Roles relevantes para este servicio (`rolId`):
 * - `2` y `3`: roles con acceso al dashboard de administración.
 * - `4`: solicitud de administrador pendiente de aprobación; no puede
 *   iniciar sesión por ningún flujo hasta ser aprobada.
 */
@Injectable()
export class AuthService {
  constructor(private readonly users: UsersRepository) {}

  /**
   * Transporte de correo para enviar los códigos de recuperación.
   * Usa Gmail con una contraseña de aplicación; las credenciales
   * vienen de `GMAIL_USER` y `GMAIL_APP_PASSWORD`.
   */
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  /**
   * Registra un usuario final con el rol por defecto que asigne
   * {@link UsersRepository.save}.
   *
   * @throws ConflictException si el email ya está registrado.
   * @returns Solo `id` y `email`; nunca se devuelven hash ni salt.
   */
  async register(dto: RegisterDto): Promise<{ id: string; email: string }> {
    if (await this.users.findByEmail(dto.email!)) {
      throw new ConflictException('El email ya está registrado');
    }
    const salt = generateSalt();
    const user = await this.users.save(
            dto.email!,
            //hashPassword(dto.password!, salt),
            hash(dto.password! + salt),
            salt,
            dto.nombre!,
        );
    return { id: user.id!, email: user.email! };
  }

  /**
   * Registra una solicitud de administrador. Es idéntico a
   * {@link register} salvo que persiste con
   * {@link UsersRepository.saveAdmin}, que deja la cuenta como
   * pendiente (`rolId = 4`) hasta que la apruebe un super administrador
   * mediante {@link approveAdmin}.
   *
   * @throws ConflictException si el email ya está registrado.
   */
  async registerAdmin(dto: RegisterDto,): Promise<{ id: string; email: string }> {
    if (await this.users.findByEmail(dto.email!)) {
      throw new ConflictException('El email ya está registrado');
    }
    const salt = generateSalt();
    const user = await this.users.saveAdmin(
      dto.email!,
      //hashPassword(dto.password!, salt),
      hash(dto.password! + salt),
      salt,
      dto.nombre!,
    );

    return { id: user.id!, email: user.email! };
  }

  /**
   * Inicio de sesión de usuario final. Verifica credenciales, bloquea
   * a los administradores pendientes y emite un par de tokens con los
   * mismos claims (`sub`, `email`, `rolId`), diferenciados por `type`.
   *
   * A diferencia de {@link adminLogin}, los mensajes de error indican
   * si falló el usuario o la contraseña, lo que permite saber qué
   * correos están registrados.
   *
   * @throws UnauthorizedException si el usuario no existe, la
   * contraseña es incorrecta o es un administrador pendiente.
   */
  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.users.findByEmail(dto.email!);

    if (!user) {
      throw new UnauthorizedException('El usuario no existe');
    }

    //if (!verifyPassword(dto.password!, user.salt!, user.passwordHash!)) {
    if (hash(dto.password! + user.salt!) !== user.passwordHash!) {
      throw new UnauthorizedException('Password incorrecto');
    }

    if (!user) {
      throw new UnauthorizedException('El usuario no existe');
    }

    if (user.rolId === 4) {
      throw new UnauthorizedException('Tu solicitud de administrador está pendiente de aprobación');
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

  /**
   * Inicio de sesión del dashboard. Solo admite roles `2` y `3`, lo
   * que deja fuera tanto a usuarios finales como a administradores
   * pendientes (`4`).
   *
   * Usuario inexistente y contraseña incorrecta responden con el mismo
   * mensaje genérico para no revelar qué correos existen.
   *
   * @throws UnauthorizedException si las credenciales son incorrectas
   * o el rol no tiene acceso al dashboard.
   */
  async adminLogin(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.users.findByEmail(dto.email!);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    //if (!verifyPassword(dto.password!, user.salt!,user.passwordHash!)) {
    if (hash(dto.password! + user.salt!) !== user.passwordHash!) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (user.rolId !== 2 && user.rolId !== 3) {
      throw new UnauthorizedException('No tienes permisos para acceder al dashboard');
    }

    const claims = {sub: user.id!, email: user.email!, rolId: user.rolId!};

    const accessToken = sign(
      { ...claims, type: 'access' },
      ACCESS_TTL,
    );

    const refreshToken = sign(
      { ...claims, type: 'refresh' },
      REFRESH_TTL,
    );

    return { accessToken, refreshToken };
  }

  /** Devuelve las solicitudes de administrador aún no aprobadas. */
  async getPendingAdmins() {
    return this.users.findPendingAdmins();
  }

  /**
   * Aprueba una solicitud de administrador pendiente.
   *
   * @throws NotFoundException si el id no corresponde a una solicitud
   * pendiente (no existe o ya fue aprobada).
   */
  async approveAdmin(id: string) {
    const approved = await this.users.approveAdmin(id);

    if (!approved) {
      throw new NotFoundException('No se encontró una solicitud pendiente');
    }

    return {
      message: 'Administrador aprobado correctamente'
    };
  }

  /**
   * Emite un nuevo access token a partir de un refresh token válido.
   * Es síncrono porque no consulta la base: copia los claims del
   * refresh token tal cual.
   *
   * Consecuencia: si al usuario se le cambia el rol o se le da de baja,
   * los access tokens renovados conservan el `rolId` anterior hasta que
   * expire el refresh token (hasta 7 días). Tampoco se rota el refresh
   * token; se reutiliza el mismo durante toda su vida.
   *
   * @throws UnauthorizedException si el token es inválido, expiró o no
   * es de tipo `refresh` (evita usar un access token para renovar).
   */
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

  /**
   * Genera un código de recuperación de 6 caracteres, lo guarda con
   * vigencia de 15 minutos y lo envía al correo del usuario.
   *
   * El alfabeto excluye caracteres ambiguos (`0/O`, `1/I/L`) para que
   * el código sea fácil de transcribir, y se usa `randomInt` de
   * `node:crypto` en lugar de `Math.random` porque es
   * criptográficamente seguro.
   *
   * @throws UnauthorizedException si el correo no está registrado.
   */
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

  /**
   * Cambia la contraseña usando un código generado por
   * {@link forgotPassword}. Genera un salt nuevo junto con el hash y,
   * al terminar, marca el código como usado para que no se pueda
   * reutilizar.
   *
   * Se asume que {@link UsersRepository.findRecoveryCode} solo devuelve
   * códigos aún no usados; la expiración se valida aquí.
   *
   * @throws UnauthorizedException si el usuario no existe, el código no
   * es válido o ya expiró.
   */
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
    //const passwordHash = hashPassword(dto.nuevaContrasena, salt);
    const passwordHash = hash(dto.nuevaContrasena + salt);
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