import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllProductsQueryDto } from './dto/query-product.dto';
import { BrandsService } from 'src/brands/brands.service';
import { CategoriesService } from 'src/categories/categories.service';
export declare class ProductsService {
    private readonly db;
    private readonly brandsService;
    private readonly categoriesService;
    constructor(db: Kysely<DB>, brandsService: BrandsService, categoriesService: CategoriesService);
    create(createProductDto: CreateProductDto): Promise<{
        media: {
            id: number;
            tipo: "IMAGEN" | "VIDEO";
            url: string;
            es_principal: boolean;
            id_producto: number;
        }[];
        nombre: string;
        id: number;
        descripcion: string;
        precio: number;
        id_marca: number;
        id_categoria: number;
    }>;
    findAll(query: FindAllProductsQueryDto): Promise<{
        nombre: string;
        id: number;
        descripcion: string;
        precio: number;
        id_marca: number;
        id_categoria: number;
    }[]>;
    findOne(id: number): Promise<{
        media: {
            id: number;
            tipo: "IMAGEN" | "VIDEO";
            url: string;
            es_principal: boolean;
            id_producto: number;
        }[];
        nombre: string;
        id: number;
        descripcion: string;
        precio: number;
        id_marca: number;
        id_categoria: number;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        media: {
            id: number;
            tipo: "IMAGEN" | "VIDEO";
            url: string;
            es_principal: boolean;
            id_producto: number;
        }[];
        nombre: string;
        id: number;
        descripcion: string;
        precio: number;
        id_marca: number;
        id_categoria: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
