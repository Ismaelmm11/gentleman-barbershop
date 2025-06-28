import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class TelegramService {
    private readonly httpService;
    private readonly configService;
    private readonly botToken;
    private readonly apiUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    sendMessage(chatId: string, text: string): Promise<void>;
}
