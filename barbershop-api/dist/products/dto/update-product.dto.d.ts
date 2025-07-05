import { CreateProductDto } from './create-product.dto';
import { ProductMediaDto } from './product-media.dto';
declare const ProductDataDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateProductDto>>;
declare class ProductDataDto extends ProductDataDto_base {
    media?: never;
}
export declare class UpdateProductDto extends ProductDataDto {
    media_a_anadir?: ProductMediaDto[];
    media_ids_a_eliminar?: number[];
}
export {};
