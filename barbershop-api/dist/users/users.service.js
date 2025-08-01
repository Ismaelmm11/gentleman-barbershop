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
const recurring_blocks_service_1 = require("../recurring-blocks/recurring-blocks.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    db;
    recurringBlocksService;
    constructor(db, recurringBlocksService) {
        this.db = db;
        this.recurringBlocksService = recurringBlocksService;
    }
    async create(createUserDto, creator) {
        const { tipo_perfil, username, password, fecha_nacimiento, ...restOfUserData } = createUserDto;
        if (tipo_perfil !== 'CLIENTE' && (!creator || creator.rol !== 'ADMIN')) {
            throw new common_1.UnauthorizedException('No tienes permisos para crear este tipo de usuario.');
        }
        if (tipo_perfil === 'CLIENTE' && (username || password)) {
            throw new common_1.BadRequestException('Los clientes no pueden tener username o password.');
        }
        if (tipo_perfil !== 'CLIENTE' && (!username || !password)) {
            throw new common_1.BadRequestException('El username y la password son obligatorios para este tipo de perfil.');
        }
        if (username) {
            const existingUser = await this.findOneByUsername(username);
            if (existingUser) {
                throw new common_1.ConflictException(`El nombre de usuario '${username}' ya está en uso.`);
            }
        }
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        const existingPhone = await this.findOneByPhone(createUserDto.telefono);
        if (existingPhone) {
            throw new common_1.ConflictException(`El número de teléfono '${createUserDto.telefono}' ya está registrado.`);
        }
        const newUserId = await this.db.transaction().execute(async (trx) => {
            const userResult = await trx
                .insertInto('usuario')
                .values({
                ...restOfUserData,
                username,
                fecha_nacimiento: new Date(fecha_nacimiento),
                password: hashedPassword,
            })
                .executeTakeFirstOrThrow();
            const userId = Number(userResult.insertId);
            await trx
                .insertInto('perfil')
                .values({
                id_usuario: userId,
                tipo: tipo_perfil,
            })
                .execute();
            return userId;
        });
        if (['BARBERO', 'TATUADOR'].includes(tipo_perfil)) {
            await this.recurringBlocksService.create(newUserId, {
                dias_semana: [1],
                hora_inicio: '06:00',
                hora_fin: '23:59',
                titulo: 'Descanso por defecto',
            });
            await this.recurringBlocksService.create(newUserId, {
                dias_semana: [7],
                hora_inicio: '06:00',
                hora_fin: '23:59',
                titulo: 'Descanso por defecto',
            });
        }
        return this.findOne(newUserId);
    }
    async findAll(queryParams) {
        const { limit = 10, page = 1, searchTerm, rol } = queryParams;
        const offset = (page - 1) * limit;
        let dataQuery = this.db.selectFrom('usuario').selectAll();
        let countQuery = this.db.selectFrom('usuario').select((eb) => eb.fn.countAll().as('total'));
        if (rol) {
            dataQuery = dataQuery.innerJoin('perfil', 'perfil.id_usuario', 'usuario.id')
                .where('perfil.tipo', '=', rol);
            countQuery = countQuery.innerJoin('perfil', 'perfil.id_usuario', 'usuario.id')
                .where('perfil.tipo', '=', rol);
        }
        if (searchTerm) {
            const filter = `%${searchTerm}%`;
            dataQuery = dataQuery.where((eb) => eb.or([
                eb('nombre', 'like', filter),
                eb('apellidos', 'like', filter),
                eb('telefono', 'like', filter)
            ]));
            countQuery = countQuery.where((eb) => eb.or([
                eb('nombre', 'like', filter),
                eb('apellidos', 'like', filter),
                eb('telefono', 'like', filter)
            ]));
        }
        const [users, countResult] = await Promise.all([
            dataQuery.limit(limit).offset(offset).execute(),
            countQuery.executeTakeFirstOrThrow(),
        ]);
        const sanitizedUsers = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        const total = Number(countResult.total);
        return {
            data: sanitizedUsers,
            meta: {
                total: total,
                page,
                limit,
                last_page: Math.ceil(total / limit),
            }
        };
    }
    async findOne(id) {
        const user = await this.db
            .selectFrom('usuario')
            .innerJoin('perfil', 'perfil.id_usuario', 'usuario.id')
            .selectAll('usuario')
            .select(['perfil.tipo as rol'])
            .where('usuario.id', '=', id)
            .executeTakeFirst();
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado.`);
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async findOneByUsername(username) {
        return this.db
            .selectFrom('usuario')
            .innerJoin('perfil', 'perfil.id_usuario', 'usuario.id')
            .selectAll('usuario')
            .select('perfil.tipo as rol')
            .where('username', '=', username)
            .executeTakeFirst();
    }
    async findOneByPhone(phone) {
        return this.db
            .selectFrom('usuario')
            .selectAll()
            .where('telefono', '=', phone)
            .executeTakeFirst();
    }
    async update(id, updateUserDto) {
        const { fecha_nacimiento, password, ...restOfDto } = updateUserDto;
        const dataToUpdate = { ...restOfDto };
        if (fecha_nacimiento) {
            dataToUpdate.fecha_nacimiento = new Date(fecha_nacimiento);
        }
        if (password) {
            throw new common_1.BadRequestException('Para cambiar la contraseña, por favor use la ruta específica.');
        }
        await this.db
            .updateTable('usuario')
            .set(dataToUpdate)
            .where('id', '=', id)
            .executeTakeFirst();
        return this.findOne(id);
    }
    async updateProfile(userId, updateProfileDto) {
        const profile = await this.db.selectFrom('perfil').selectAll().where('id_usuario', '=', userId).executeTakeFirst();
        if (!profile) {
            throw new common_1.NotFoundException(`No se encontró un perfil para el usuario con ID ${userId}.`);
        }
        await this.db
            .updateTable('perfil')
            .set({ tipo: updateProfileDto.tipo_perfil })
            .where('id_usuario', '=', userId)
            .execute();
        return { message: `Perfil del usuario con ID ${userId} actualizado a ${updateProfileDto.tipo_perfil}.` };
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
    async findOrCreateClient(clientData, trx = this.db) {
        const existingUser = await trx
            .selectFrom('usuario')
            .selectAll()
            .where('telefono', '=', clientData.telefono)
            .executeTakeFirst();
        if (existingUser) {
            return existingUser;
        }
        return this.db.transaction().execute(async (innerTrx) => {
            const newUserResult = await innerTrx
                .insertInto('usuario')
                .values({
                nombre: clientData.nombre,
                apellidos: clientData.apellidos,
                telefono: clientData.telefono,
                fecha_nacimiento: new Date(clientData.fecha_nacimiento),
                username: null,
                password: null,
            })
                .executeTakeFirstOrThrow();
            const newUserId = Number(newUserResult.insertId);
            await innerTrx
                .insertInto('perfil')
                .values({
                id_usuario: newUserId,
                tipo: 'CLIENTE',
            })
                .execute();
            return trx
                .selectFrom('usuario')
                .selectAll()
                .where('id', '=', newUserId)
                .executeTakeFirstOrThrow();
        });
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.db.selectFrom('usuario').selectAll().where('id', '=', userId).executeTakeFirst();
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('El usuario no puede cambiar la contraseña.');
        }
        const isOldPasswordCorrect = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
        if (!isOldPasswordCorrect) {
            throw new common_1.UnauthorizedException('La contraseña antigua es incorrecta.');
        }
        const newHashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
        await this.db
            .updateTable('usuario')
            .set({ password: newHashedPassword })
            .where('id', '=', userId)
            .execute();
        return { message: 'Contraseña actualizada correctamente.' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [kysely_1.Kysely,
        recurring_blocks_service_1.RecurringBlocksService])
], UsersService);
//# sourceMappingURL=users.service.js.map