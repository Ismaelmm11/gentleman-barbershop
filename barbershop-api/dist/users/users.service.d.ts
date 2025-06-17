import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersQueryDto } from './dto/find-all-users-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private readonly db;
    constructor(db: Kysely<DB>);
    create(createUserDto: CreateUserDto, creator?: {
        userId: number;
        rol: string;
    }): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }>;
    findAll(queryParams: FindAllUsersQueryDto): Promise<{
        data: {
            id: number;
            nombre: string;
            apellidos: string;
            username: string | null;
            telefono: string;
            fecha_nacimiento: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            last_page: number;
        };
    }>;
    findOne(id: number): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }>;
    findOneByUsername(username: string): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        password: string | null;
        telefono: string;
        fecha_nacimiento: Date;
        rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
    } | undefined>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }>;
    changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<{
        message: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
