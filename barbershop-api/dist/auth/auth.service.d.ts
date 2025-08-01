import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
export declare class AuthService {
    private usersService;
    private jwtService;
    private readonly db;
    constructor(usersService: UsersService, jwtService: JwtService, db: Kysely<DB>);
    login(username: string, pass: string): Promise<{
        access_token: string;
        user: {
            password: string | null;
            nombre: string;
            apellidos: string;
            telefono: string;
            fecha_nacimiento: Date;
            username: string | null;
            id: number;
            rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
        };
    }>;
    logout(token: string): Promise<{
        message: string;
    }>;
}
