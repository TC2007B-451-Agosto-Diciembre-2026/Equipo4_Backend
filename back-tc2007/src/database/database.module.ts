import { Module, OnModuleDestroy, Inject } from '@nestjs/common';
import { createPool } from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';

/** Token de inyección del pool de conexiones `mysql2`. Se inyecta con `@Inject(DB_POOL)`. */
export const DB_POOL = 'DB_POOL';

/**
 * Cadena de conexión a MySQL.
 *
 * Nota de documentación: está hardcodeada (usuario/contraseña/host
 * incluidos). En un ambiente real debería venir de una variable de
 * entorno (`process.env.DATABASE_URL`) para no exponer credenciales
 * en el repositorio ni forzar el mismo servidor en todos los ambientes.
 */
const DATABASE_URL = 'mysql://root:12345@localhost:3306/fraud2';

/**
 * Módulo global de acceso a base de datos. Expone un único pool de
 * conexiones (`mysql2/promise`, sin ORM) bajo el token {@link DB_POOL},
 * que todos los repositorios de la app inyectan y usan directamente
 * con `pool.query(...)`.
 */
@Module({
  providers: [
    {
      provide: DB_POOL,
      useFactory: () => {
        console.log('Conectando a ' + DATABASE_URL);
        return createPool({ uri: DATABASE_URL });
      },
    },
  ],
  exports: [DB_POOL],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  /** Cierra el pool de conexiones al apagar la aplicación. */
  onModuleDestroy() {
    return this.pool.end();
  }
}
