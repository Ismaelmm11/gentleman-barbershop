"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MessagingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("./providers/telegram.service");
let MessagingService = MessagingService_1 = class MessagingService {
    telegramService;
    logger = new common_1.Logger(MessagingService_1.name);
    constructor(telegramService) {
        this.telegramService = telegramService;
    }
    async sendOtp(recipient, message) {
        try {
            this.logger.log(`Iniciando envío de OTP a ${recipient} vía Telegram...`);
            await this.telegramService.sendMessage(recipient, message);
            this.logger.log(`OTP enviado correctamente a ${recipient}.`);
        }
        catch (error) {
            this.logger.error(`Fallo al enviar OTP a ${recipient}`, error.stack);
            throw new Error('No se pudo enviar el mensaje de verificación.');
        }
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = MessagingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_service_1.TelegramService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map