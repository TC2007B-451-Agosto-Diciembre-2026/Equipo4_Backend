import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const ROUNDS = 10;


export function generateSalt(): string {
    return randomBytes(32).toString('hex');
}

export function hashPassword(contrasena_plana: string, salt: string): string {
    return bcrypt.hashSync(contrasena_plana + salt, ROUNDS);
}

export function verifyPassword(contrasena_plana: string, salt: string, contrasena_hasheada: string): boolean {
    return bcrypt.compareSync(contrasena_plana + salt, contrasena_hasheada);
}

