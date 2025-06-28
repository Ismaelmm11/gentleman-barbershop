// barbershop-api/src/messaging/messaging.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MessagingService } from './messaging.service';
import { TelegramService } from './providers/telegram.service';

/**
 * Módulo genérico para manejar el envío de mensajes (OTP, notificaciones, etc.).
 *
 * @Global() - Lo convierte en un módulo global, haciendo que sus servicios
 * exportados estén disponibles en toda la aplicación sin necesidad de re-importarlo.
 */
@Global()
@Module({
  // Importamos HttpModule para hacer peticiones HTTP (para llamar a la API de Telegram)
  // y ConfigModule para leer las credenciales del archivo .env.
  imports: [HttpModule, ConfigModule],
  providers: [
    // El servicio principal que usarán otros módulos.
    MessagingService,
    // La implementación específica para Telegram.
    TelegramService,
  ],
  // Exportamos SÓLO el servicio principal para mantener la abstracción.
  exports: [MessagingService],
})
export class MessagingModule {}
