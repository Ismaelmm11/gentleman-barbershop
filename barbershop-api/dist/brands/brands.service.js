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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const database_provider_1 = require("../database/database.provider");
let BrandsService = class BrandsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createBrandDto) {
        const existingBrand = await this.db
            .selectFrom('marca')
            .select('id')
            .where('nombre', '=', createBrandDto.nombre)
            .executeTakeFirst();
        if (existingBrand) {
            throw new common_1.ConflictException(`La marca con el nombre '${createBrandDto.nombre}' ya existe.`);
        }
        const result = await this.db
            .insertInto('marca')
            .values(createBrandDto)
            .executeTakeFirstOrThrow();
        return this.findOne(Number(result.insertId));
    }
    async findAll() {
        return this.db.selectFrom('marca').selectAll().orderBy('nombre', 'asc').execute();
    }
    async findOne(id) {
        const brand = await this.db
            .selectFrom('marca')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
        if (!brand) {
            throw new common_1.NotFoundException(`Marca con ID ${id} no encontrada.`);
        }
        return brand;
    }
    async update(id, updateBrandDto) {
        await this.findOne(id);
        if (updateBrandDto.nombre) {
            const existingBrand = await this.db
                .selectFrom('marca')
                .select('id')
                .where('nombre', '=', updateBrandDto.nombre)
                .where('id', '!=', id)
                .executeTakeFirst();
            if (existingBrand) {
                throw new common_1.ConflictException(`La marca con el nombre '${updateBrandDto.nombre}' ya existe.`);
            }
        }
        await this.db
            .updateTable('marca')
            .set(updateBrandDto)
            .where('id', '=', id)
            .execute();
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        try {
            await this.db.deleteFrom('marca').where('id', '=', id).execute();
            return { message: `Marca con ID ${id} eliminada correctamente.` };
        }
        catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                throw new common_1.ConflictException('No se puede eliminar la marca porque está siendo utilizada por uno o más productos.');
            }
            throw error;
        }
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [kysely_1.Kysely])
], BrandsService);
//# sourceMappingURL=brands.service.js.map