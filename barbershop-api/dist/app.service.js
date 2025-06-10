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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const database_provider_1 = require("./database/database.provider");
let AppService = AppService_1 = class AppService {
    db;
    logger = new common_1.Logger(AppService_1.name);
    constructor(db) {
        this.db = db;
    }
    getHello() {
        return '¡Bienvenido a la API de Gentleman Barbershop!';
    }
    async checkDbConnection() {
        try {
            await (0, kysely_1.sql) `SELECT 1`.execute(this.db);
            this.logger.log('Conexión con la base de datos verificada con éxito.');
            return {
                status: 'ok',
                message: 'La conexión con la base de datos funciona perfectamente.',
            };
        }
        catch (error) {
            this.logger.error('¡Fallo al conectar con la base de datos!', error.stack);
            return {
                status: 'error',
                message: 'No se pudo establecer conexión con la base de datos.',
            };
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = AppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [kysely_1.Kysely])
], AppService);
//# sourceMappingURL=app.service.js.map