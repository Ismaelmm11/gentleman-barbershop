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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const public_decorator_1 = require("../decorators/public.decorator");
const kysely_1 = require("kysely");
const database_provider_1 = require("../../database/database.provider");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    reflector;
    db;
    constructor(reflector, db) {
        super();
        this.reflector = reflector;
        this.db = db;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token && !isPublic) {
            throw new common_1.UnauthorizedException('Se requiere un token de acceso.');
        }
        if (token) {
            const jti = this.getJtiFromToken(token);
            if (jti) {
                const isBlocked = await this.db
                    .selectFrom('token_blocklist')
                    .where('jti', '=', jti)
                    .select('jti')
                    .executeTakeFirst();
                if (isBlocked) {
                    throw new common_1.UnauthorizedException('Token inválido (revocado).');
                }
            }
        }
        try {
            await super.canActivate(context);
        }
        catch (error) {
            if (!isPublic) {
                throw error;
            }
        }
        return true;
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers['authorization']?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
    getJtiFromToken(token) {
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            return payload.jti || null;
        }
        catch (e) {
            return null;
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [core_1.Reflector,
        kysely_1.Kysely])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map