import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly db;
    constructor(db: Kysely<DB>);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        nombre: string;
        id: number;
        url_imagen: string | null;
    }>;
    findAll(): Promise<{
        nombre: string;
        id: number;
        url_imagen: string | null;
    }[]>;
    findOne(id: number): Promise<{
        nombre: string;
        id: number;
        url_imagen: string | null;
    }>;
    update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<{
        nombre: string;
        id: number;
        url_imagen: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
