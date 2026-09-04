import {Module, OnModuleDestroy,Inject} from '@nestjs/common';
import {createPool} from 'mysql2/promise';
import type {Pool} from 'mysql2/promise';

export const DB_POOL = 'DB_POOL';

const DATABASE_URL= 'mysql://root:12345@localhost:3306/fraud2';

@Module({
  providers: [
    {
        provide: DB_POOL,
        useFactory: () => {
            console.log ('Conectando a ' + DATABASE_URL);
            return createPool({ uri: DATABASE_URL });
      },
    
    },

    ],
    exports: [DB_POOL],
})

export class DatabaseModule implements OnModuleDestroy {
    constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

    onModuleDestroy() {
        return this.pool.end();
    }
}