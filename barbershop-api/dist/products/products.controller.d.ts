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
            id_producto: number;
            tipo: "IMAGEN" | "VIDEO";
            url: string;
            es_principal: boolean;
        }[];
        id: number;
        nombre: string;
        descripcion: string;
        precio: number;
        id_categoria: number;
        id_marca: number;
    }>;
    findAll(query: FindAllProductsQueryDto): Promise<{
        id: number;
        nombre: string;
        descripcion: string;
        precio: number;
        id_categoria: number;
        id_marca: number;
    }[]>;
    findOne(id: number): Promise<{
        media: {
            id: number;
            id_producto: number;
            tipo: "IMAGEN" | "VIDEO";
            url: string;
            es_principal: boolean;
        }[];
        id: number;
        nombre: string;
        descripcion: string;
        precio: number;
        id_categoria: number;
        id_marca: number;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        media: {
            id: number;
            id_producto: number;
            tipo: "IMAGEN" | "VIDEO";
            url: string;
            es_principal: boolean;
        }[];
        id: number;
        nombre: string;
        descripcion: string;
        precio: number;
        id_categoria: number;
        id_marca: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
