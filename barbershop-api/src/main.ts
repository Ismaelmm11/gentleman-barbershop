// barbershop-api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Le decimos a nuestra aplicación que use un ValidationPipe de forma global.
  // Esto significa que TODAS las peticiones que lleguen a CUALQUIER controlador
  // pasarán por este pipe y serán validadas automáticamente.
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true -> Elimina automáticamente cualquier propiedad que NO esté en el DTO.
      whitelist: true,
      // forbidNonWhitelisted: true -> Lanza un error si se reciben propiedades no deseadas.
      forbidNonWhitelisted: true,
      
      // ---- ¡AQUÍ ESTÁ LA MAGIA! ----
      // transform: true -> Le dice al pipe que transforme los datos entrantes a sus tipos de DTO.
      // Esto convertirá automáticamente el string "2" de la URL a un número 2.
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Permite conversiones de tipo implícitas
      }
    }),
  );

  await app.listen(3000);
}
bootstrap();
