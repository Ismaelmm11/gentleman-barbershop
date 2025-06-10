import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly db;
    constructor(db: Kysely<DB>);
    create(createUserDto: CreateUserDto): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }>;
    findAll(): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
