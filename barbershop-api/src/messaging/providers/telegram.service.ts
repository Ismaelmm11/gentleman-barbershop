// barbershop-api/src/messaging/providers/telegram.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TelegramService {
  private readonly botToken: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // --- CORRECCIÓN AÑADIDA ---
    // 1. Leemos el token en una variable temporal. Su tipo es 'string | undefined'.
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    // 2. Verificamos la variable temporal. Si no existe, lanzamos un error.
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN no está definido en el archivo .env');
    }

    // 3. Solo después de la verificación, asignamos el valor a las propiedades de la clase.
    // TypeScript ahora sabe que 'token' es un 'string', por lo que la asignación es segura.
    this.botToken = token;
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Realiza la llamada real a la API de Telegram para enviar un mensaje.
   * @param chatId - El ID del chat de destino.
   * @param text - El contenido del mensaje a enviar.
   */
  async sendMessage(chatId: string, text: string): Promise<void> {
    const url = `${this.apiUrl}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: text,
    };

    // Usamos firstValueFrom para convertir el Observable de HttpService en una Promesa.
    await firstValueFrom(this.httpService.post(url, payload));
  }
}
