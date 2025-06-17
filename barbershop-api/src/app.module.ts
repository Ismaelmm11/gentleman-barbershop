// barbershop-api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Importamos el ConfigModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module'; // Importamos nuestro módulo
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // ConfigModule.forRoot() carga las variables del archivo .env
    // y las hace disponibles globalmente a través de `process.env`.
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule, // ¡Lo añadimos aquí!
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}