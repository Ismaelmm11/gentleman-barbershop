import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
    create(createBrandDto: CreateBrandDto): Promise<{
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
    update(id: number, updateBrandDto: UpdateBrandDto): Promise<{
        nombre: string;
        id: number;
        url_imagen: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
