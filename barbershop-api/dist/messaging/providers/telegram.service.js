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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let TelegramService = class TelegramService {
    httpService;
    configService;
    botToken;
    apiUrl;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        const token = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN no está definido en el archivo .env');
        }
        this.botToken = token;
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }
    async sendMessage(chatId, text) {
        const url = `${this.apiUrl}/sendMessage`;
        const payload = {
            chat_id: chatId,
            text: text,
        };
        await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload));
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map