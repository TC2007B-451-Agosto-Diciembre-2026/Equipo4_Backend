import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

/** Costo de bcrypt (número de rondas). 10 es el valor por defecto recomendado. */
const ROUNDS = 10;

/**
 * Genera un salt aleatorio de 32 bytes (64 caracteres hex) para
 * concatenar manualmente a la contraseña antes de hashear.
 *
 * Nota de documentación: bcrypt ya genera e incluye su propio salt
 * dentro del hash que produce (`bcrypt.hashSync` es determinístico
 * respecto a esto), así que este salt adicional es técnicamente
 * redundante para la seguridad del hash — no hace daño, pero tampoco
 * añade protección extra. Se documenta tal cual está, sin cambiarlo,
 * porque el esquema (columna `salt` separada) ya está en producción.
 */
export function generateSalt(): string {
  return randomBytes(32).toString('hex');
}

/** Hashea `contrasena_plana + salt` con bcrypt. El resultado es lo que se guarda en `usuario.contrasena`. */
export function hashPassword(contrasena_plana: string, salt: string): string {
  return bcrypt.hashSync(contrasena_plana + salt, ROUNDS);
}

/** Verifica que `contrasena_plana + salt` produzca el mismo hash que `contrasena_hasheada`. */
export function verifyPassword(
  contrasena_plana: string,
  salt: string,
  contrasena_hasheada: string,
): boolean {
  return bcrypt.compareSync(contrasena_plana + salt, contrasena_hasheada);
}
