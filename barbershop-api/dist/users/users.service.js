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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const database_provider_1 = require("../database/database.provider");
let UsersService = class UsersService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createUserDto) {
        const { fecha_nacimiento, ...restOfDto } = createUserDto;
        const result = await this.db
            .insertInto('usuario')
            .values({
            ...restOfDto,
            fecha_nacimiento: new Date(fecha_nacimiento),
        })
            .executeTakeFirstOrThrow();
        const newUserId = Number(result.insertId);
        return this.findOne(newUserId);
    }
    async findAll() {
        const users = await this.db.selectFrom('usuario').selectAll().execute();
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
    async findOne(id) {
        const user = await this.db
            .selectFrom('usuario')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado.`);
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async update(id, updateUserDto) {
        const { fecha_nacimiento, ...restOfDto } = updateUserDto;
        const dataToUpdate = { ...restOfDto };
        if (fecha_nacimiento) {
            dataToUpdate.fecha_nacimiento = new Date(fecha_nacimiento);
        }
        await this.db
            .updateTable('usuario')
            .set(dataToUpdate)
            .where('id', '=', id)
            .executeTakeFirst();
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.db
            .deleteFrom('usuario')
            .where('id', '=', id)
            .executeTakeFirst();
        if (result.numDeletedRows === 0n) {
            throw new common_1.NotFoundException(`No se pudo eliminar. Usuario con ID ${id} no encontrado.`);
        }
        return { message: `Usuario con ID ${id} eliminado correctamente.` };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [kysely_1.Kysely])
], UsersService);
//# sourceMappingURL=users.service.js.map