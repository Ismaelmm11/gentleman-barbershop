import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Kysely } from 'kysely';
import { DB } from '../../database/db.types';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private reflector;
    private readonly db;
    constructor(reflector: Reflector, db: Kysely<DB>);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
    private getJtiFromToken;
}
export {};
