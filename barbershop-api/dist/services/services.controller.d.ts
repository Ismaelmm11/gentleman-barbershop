import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    create(createServiceDto: CreateServiceDto): Promise<{
        id: number;
        nombre: string;
        descripcion: string;
        duracion_minutos: number;
        precio_base: number;
    }>;
    findAll(): Promise<{
        id: number;
        nombre: string;
        descripcion: string;
        duracion_minutos: number;
        precio_base: number;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        nombre: string;
        descripcion: string;
        duracion_minutos: number;
        precio_base: number;
    }>;
    update(id: string, updateServiceDto: UpdateServiceDto): Promise<{
        id: number;
        nombre: string;
        descripcion: string;
        duracion_minutos: number;
        precio_base: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
