import { ProductMediaDto } from './product-media.dto';
export declare class CreateProductDto {
    nombre: string;
    descripcion: string;
    precio: number;
    id_marca: number;
    id_categoria: number;
    media: ProductMediaDto[];
}
