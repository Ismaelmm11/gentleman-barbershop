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
exports.RecurringBlocksService = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const database_provider_1 = require("../database/database.provider");
let RecurringBlocksService = class RecurringBlocksService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(userId, createDto) {
        this.validateTimeRange(createDto.hora_inicio, createDto.hora_fin);
        const valuesToInsert = createDto.dias_semana.map((dia) => ({
            id_usuario: userId,
            dia_semana: dia,
            hora_inicio: createDto.hora_inicio,
            hora_fin: createDto.hora_fin,
            titulo: createDto.titulo,
        }));
        await this.db
            .insertInto('horario_bloqueado_recurrente')
            .values(valuesToInsert)
            .execute();
        return this.findAllForUser(userId);
    }
    async findAllForUser(userId) {
        return this.db
            .selectFrom('horario_bloqueado_recurrente')
            .selectAll()
            .where('id_usuario', '=', userId)
            .orderBy('dia_semana', 'asc')
            .orderBy('hora_inicio', 'asc')
            .execute();
    }
    async update(blockId, userId, updateDto) {
        const block = await this.verifyOwnership(blockId, userId);
        const startTime = updateDto.hora_inicio || block.hora_inicio;
        const endTime = updateDto.hora_fin || block.hora_fin;
        this.validateTimeRange(startTime, endTime);
        const { dias_semana, ...updateData } = updateDto;
        await this.db
            .updateTable('horario_bloqueado_recurrente')
            .set(updateData)
            .where('id', '=', blockId)
            .execute();
        return this.findOne(blockId);
    }
    async remove(blockId, userId) {
        await this.verifyOwnership(blockId, userId);
        const result = await this.db
            .deleteFrom('horario_bloqueado_recurrente')
            .where('id', '=', blockId)
            .executeTakeFirst();
        if (result.numDeletedRows === 0n) {
            throw new common_1.NotFoundException(`Bloqueo con ID ${blockId} no encontrado.`);
        }
        return { message: `Bloqueo con ID ${blockId} eliminado correctamente.` };
    }
    async findOne(blockId) {
        const block = await this.db
            .selectFrom('horario_bloqueado_recurrente')
            .selectAll()
            .where('id', '=', blockId)
            .executeTakeFirst();
        if (!block) {
            throw new common_1.NotFoundException(`Bloqueo con ID ${blockId} no encontrado.`);
        }
        return block;
    }
    validateTimeRange(startTime, endTime) {
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
        }
    }
    async verifyOwnership(blockId, userId) {
        const block = await this.findOne(blockId);
        if (block.id_usuario !== userId) {
            throw new common_1.ForbiddenException('No tienes permiso para modificar este bloqueo.');
        }
        return block;
    }
};
exports.RecurringBlocksService = RecurringBlocksService;
exports.RecurringBlocksService = RecurringBlocksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [kysely_1.Kysely])
], RecurringBlocksService);
//# sourceMappingURL=recurring-blocks.service.js.map