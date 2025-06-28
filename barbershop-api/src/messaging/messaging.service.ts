// barbershop-api/src/messaging/messaging.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from './providers/telegram.service';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  // Inyectamos el servicio específico de Telegram.
  constructor(private readonly telegramService: TelegramService) {}

  /**
   * Envía un código de verificación (OTP) a un destinatario.
   * Este método delega la tarea al proveedor de servicio correspondiente.
   * @param recipient - El identificador del destinatario (para Telegram, el chat_id).
   * @param message - El mensaje completo a enviar.
   */
  async sendOtp(recipient: string, message: string): Promise<void> {
    try {
      this.logger.log(`Iniciando envío de OTP a ${recipient} vía Telegram...`);
      await this.telegramService.sendMessage(recipient, message);
      this.logger.log(`OTP enviado correctamente a ${recipient}.`);
    } catch (error) {
      this.logger.error(`Fallo al enviar OTP a ${recipient}`, error.stack);
      // En producción, podríamos tener lógica de reintentos aquí.
      throw new Error('No se pudo enviar el mensaje de verificación.');
    }
  }
}
