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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const database_provider_1 = require("../database/database.provider");
let CategoriesService = class CategoriesService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createCategoryDto) {
        const existingCategory = await this.db
            .selectFrom('categoria')
            .select('id')
            .where('nombre', '=', createCategoryDto.nombre)
            .executeTakeFirst();
        if (existingCategory) {
            throw new common_1.ConflictException(`La categoría con el nombre '${createCategoryDto.nombre}' ya existe.`);
        }
        const result = await this.db
            .insertInto('categoria')
            .values(createCategoryDto)
            .executeTakeFirstOrThrow();
        return this.findOne(Number(result.insertId));
    }
    async findAll() {
        return this.db.selectFrom('categoria').selectAll().orderBy('nombre', 'asc').execute();
    }
    async findOne(id) {
        const category = await this.db
            .selectFrom('categoria')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
        if (!category) {
            throw new common_1.NotFoundException(`Categoría con ID ${id} no encontrada.`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        await this.findOne(id);
        if (updateCategoryDto.nombre) {
            const existingCategory = await this.db
                .selectFrom('categoria')
                .select('id')
                .where('nombre', '=', updateCategoryDto.nombre)
                .where('id', '!=', id)
                .executeTakeFirst();
            if (existingCategory) {
                throw new common_1.ConflictException(`La categoría con el nombre '${updateCategoryDto.nombre}' ya existe.`);
            }
        }
        await this.db
            .updateTable('categoria')
            .set(updateCategoryDto)
            .where('id', '=', id)
            .execute();
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        try {
            await this.db.deleteFrom('categoria').where('id', '=', id).execute();
            return { message: `Categoría con ID ${id} eliminada correctamente.` };
        }
        catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                throw new common_1.ConflictException('No se puede eliminar la categoría porque está siendo utilizada por uno o más productos.');
            }
            throw error;
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [kysely_1.Kysely])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map