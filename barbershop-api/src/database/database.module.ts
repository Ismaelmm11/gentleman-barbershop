// barbershop-api/src/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { databaseProvider } from './database.provider';

// El decorador `@Global()` es clave. Convierte este módulo en un proveedor
// global. Una vez importado en el AppModule raíz, cualquier otro módulo
// de la aplicación tendrá acceso a sus `exports` sin necesidad de importarlo de nuevo.
@Global()
@Module({
  providers: [databaseProvider],
  exports: [databaseProvider], // Exportamos el proveedor para que esté disponible.
})
export class DatabaseModule {}
