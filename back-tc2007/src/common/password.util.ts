import * as bcrypt from 'bcrypt';

const ROUNDS = 10;

export function hashPassword(contrasena_plana: string): string {
    return bcrypt.hashSync(contrasena_plana, ROUNDS);
}

export function verifyPassword(contrasena_plana: string, contrasena_hasheada: string): boolean {
    return bcrypt.compareSync(contrasena_plana, contrasena_hasheada);
}

