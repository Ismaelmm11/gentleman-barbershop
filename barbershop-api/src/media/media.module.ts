// barbershop-api/src/media/media.module.ts
import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'nestjs-cloudinary';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [
    // Importamos y configuramos el módulo de Cloudinary.
    // Lo hacemos de forma asíncrona para poder leer las credenciales
    // de forma segura desde el ConfigService (que a su vez lee el .env).
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true, // Hace que el servicio de Cloudinary esté disponible en todo el módulo
        cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
        api_key: configService.get<string>('CLOUDINARY_API_KEY'),
        api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  // Exportamos el MediaService para que en el futuro otros módulos
  // (como el de Productos) puedan usarlo si es necesario.
  exports: [MediaService],
})
export class MediaModule {}
