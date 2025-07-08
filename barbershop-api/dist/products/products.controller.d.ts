import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllProductsQueryDto } from './dto/query-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
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
