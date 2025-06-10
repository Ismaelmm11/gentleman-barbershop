// barbershop-api/src/app.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { DB } from './database/db.types';
import { DATABASE_TOKEN } from './database/database.provider';

@Injectable()
export class AppService {
  // Creamos un logger para poder ver mensajes en la consola de NestJS. Es una buena práctica.
  private readonly logger = new Logger(AppService.name);

  // Inyectamos nuestra instancia de Kysely (la conexión a la BD).
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>) {}

  getHello(): string {
    return '¡Bienvenido a la API de Gentleman Barbershop!';
  }

  // Nuevo método para comprobar la conexión a la base de datos.
  async checkDbConnection(): Promise<{ status: string; message: string }> {
    try {
      // Usamos Kysely para ejecutar la consulta más simple posible a la base de datos.
      // `sql` es un helper de Kysely para ejecutar SQL puro de forma segura.
      // `SELECT 1` no toca ninguna tabla, solo le pregunta a MySQL: "¿estás vivo?".
      await sql`SELECT 1`.execute(this.db);
      
      this.logger.log('Conexión con la base de datos verificada con éxito.');
      return {
        status: 'ok',
        message: 'La conexión con la base de datos funciona perfectamente.',
      };
    } catch (error) {
      this.logger.error('¡Fallo al conectar con la base de datos!', error.stack);
      return {
        status: 'error',
        message: 'No se pudo establecer conexión con la base de datos.',
      };
    }
  }
}
