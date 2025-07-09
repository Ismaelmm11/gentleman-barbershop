import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersQueryDto } from './dto/find-all-users-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RecurringBlocksService } from 'src/recurring-blocks/recurring-blocks.service';
export declare class UsersService {
    private readonly db;
    private readonly recurringBlocksService;
    constructor(db: Kysely<DB>, recurringBlocksService: RecurringBlocksService);
    create(createUserDto: CreateUserDto, creator?: {
        userId: number;
        rol: string;
    }): Promise<{
        nombre: string;
        apellidos: string;
        telefono: string;
        fecha_nacimiento: Date;
        username: string | null;
        id: number;
        rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
    }>;
    findAll(queryParams: FindAllUsersQueryDto): Promise<{
        data: {
            nombre: string;
            apellidos: string;
            telefono: string;
            fecha_nacimiento: Date;
            username: string | null;
            id: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            last_page: number;
        };
    }>;
    findOne(id: number): Promise<{
        nombre: string;
        apellidos: string;
        telefono: string;
        fecha_nacimiento: Date;
        username: string | null;
        id: number;
        rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
    }>;
    findOneByUsername(username: string): Promise<{
        password: string | null;
        nombre: string;
        apellidos: string;
        telefono: string;
        fecha_nacimiento: Date;
        username: string | null;
        id: number;
        rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
    } | undefined>;
    findOneByPhone(phone: string): Promise<{
        password: string | null;
        nombre: string;
        apellidos: string;
        telefono: string;
        fecha_nacimiento: Date;
        username: string | null;
        id: number;
    } | undefined>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        nombre: string;
        apellidos: string;
        telefono: string;
        fecha_nacimiento: Date;
        username: string | null;
        id: number;
        rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
    }>;
    updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<{
        message: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    findOrCreateClient(clientData: {
        nombre: string;
        apellidos: string;
        telefono: string;
        fecha_nacimiento: string;
    }, trx?: Kysely<DB>): Promise<{
        password: string | null;
        nombre: string;
        apellidos: string;
        telefono: string;
        fecha_nacimiento: Date;
        username: string | null;
        id: number;
    }>;
    changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
