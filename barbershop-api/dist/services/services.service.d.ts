import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesService {
    private readonly db;
    constructor(db: Kysely<DB>);
    create(createServiceDto: CreateServiceDto): Promise<{
        nombre: string;
        id: number;
        descripcion: string;
        duracion_minutos: number;
        precio_base: number;
    }>;
    findAll(): Promise<{
        nombre: string;
        id: number;
        descripcion: string;
        duracion_minutos: number;
        precio_base: number;
    }[]>;
    findOne(id: number): Promise<{
        nombre: string;
        id: number;
        descripcion: string;
        duracion_minutos: number;
        precio_base: number;
    }>;
    update(id: number, updateServiceDto: UpdateServiceDto): Promise<{
        nombre: string;
        id: number;
        descripcion: string;
        duracion_minutos: number;
        precio_base: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
