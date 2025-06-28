import { TelegramService } from './providers/telegram.service';
export declare class MessagingService {
    private readonly telegramService;
    private readonly logger;
    constructor(telegramService: TelegramService);
    sendOtp(recipient: string, message: string): Promise<void>;
}
