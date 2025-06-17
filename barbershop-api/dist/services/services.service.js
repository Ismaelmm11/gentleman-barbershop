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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const database_provider_1 = require("../database/database.provider");
let ServicesService = class ServicesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createServiceDto) {
        const result = await this.db
            .insertInto('servicio')
            .values(createServiceDto)
            .executeTakeFirstOrThrow();
        const newServiceId = Number(result.insertId);
        return this.findOne(newServiceId);
    }
    async findAll() {
        return this.db.selectFrom('servicio').selectAll().execute();
    }
    async findOne(id) {
        const service = await this.db
            .selectFrom('servicio')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
        if (!service) {
            throw new common_1.NotFoundException(`Servicio con ID ${id} no encontrado.`);
        }
        return service;
    }
    async update(id, updateServiceDto) {
        await this.db
            .updateTable('servicio')
            .set(updateServiceDto)
            .where('id', '=', id)
            .executeTakeFirstOrThrow();
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.db
            .deleteFrom('servicio')
            .where('id', '=', id)
            .executeTakeFirst();
        if (result.numDeletedRows === 0n) {
            throw new common_1.NotFoundException(`No se pudo eliminar. Servicio con ID ${id} no encontrado.`);
        }
        return { message: `Servicio con ID ${id} eliminado correctamente.` };
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [kysely_1.Kysely])
], ServicesService);
//# sourceMappingURL=services.service.js.map