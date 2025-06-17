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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const kysely_1 = require("kysely");
const database_provider_1 = require("../database/database.provider");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    usersService;
    jwtService;
    db;
    constructor(usersService, jwtService, db) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.db = db;
    }
    async login(username, pass) {
        const user = await this.usersService.findOneByUsername(username);
        if (!user || !user.password || !(await bcrypt.compare(pass, user.password))) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const payload = {
            sub: user.id,
            username: user.username,
            rol: user.rol,
            jti: (0, crypto_1.randomUUID)(),
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async logout(token) {
        try {
            const payload = this.jwtService.verify(token);
            const jti = payload.jti;
            if (!jti) {
                throw new Error('Token no invalidable.');
            }
            const expirationDate = new Date(payload.exp * 1000);
            await this.db
                .insertInto('token_blocklist')
                .values({
                jti: jti,
                fecha_expiracion: expirationDate,
            })
                .execute();
            return { message: 'Sesión cerrada correctamente.' };
        }
        catch (error) {
            return { message: 'El token ya es inválido.' };
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        kysely_1.Kysely])
], AuthService);
//# sourceMappingURL=auth.service.js.map