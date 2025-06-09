// barbershop-api/src/database/database.provider.ts
import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import { DB } from './db.types'; // ¡Importamos nuestro mapa del tesoro!

// Este es un "token de inyección". Es como una etiqueta para que NestJS
// sepa exactamente qué estamos pidiendo cuando necesitemos la conexión.
export const DATABASE_TOKEN = 'KYSELY_INSTANCE';

export const databaseProvider = {
  provide: DATABASE_TOKEN,
  useFactory: () => {
    // El "dialecto" le dice a Kysely que vamos a hablar con una base de datos MySQL.
    const dialect = new MysqlDialect({
      // `createPool` es mucho más eficiente que una conexión simple.
      // Gestiona un conjunto de conexiones listas para ser usadas.
      pool: createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10), // Convertimos el puerto a número
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: 10, // Número de conexiones máximas en el pool
      }),
    });

    // ¡Aquí ocurre la magia! Creamos la instancia de Kysely,
    // pasándole el dialecto y, lo más importante, el tipo <DB>.
    // Ahora, `db` es una instancia súper inteligente que conoce
    // toda nuestra base de datos gracias a `db.types.ts`.
    const db = new Kysely<DB>({
      dialect,
    });

    return db;
  },
};
