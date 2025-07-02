// barbershop-api/src/messaging/messaging.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MessagingService } from './messaging.service';
import { TelegramService } from './providers/telegram.service';

/**
 * Módulo genérico para manejar el envío de mensajes.
 * Declarado como @Global para que MessagingService esté disponible
 * en toda la aplicación sin necesidad de re-importarlo.
 */
@Global()
@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    // El servicio principal (recepcionista).
    MessagingService,
    // La implementación específica (el especialista de Telegram).
    TelegramService,
  ],
  // Exportamos SÓLO el servicio principal para mantener la abstracción.
  exports: [MessagingService],
})
export class MessagingModule {}
