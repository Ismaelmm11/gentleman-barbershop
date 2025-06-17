import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
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
    findOne(id: string): Promise<{
        nombre: string;
        id: number;
        descripcion: string;
        duracion_minutos: number;
        precio_base: number;
    }>;
    update(id: string, updateServiceDto: UpdateServiceDto): Promise<{
        nombre: string;
        id: number;
        descripcion: string;
        duracion_minutos: number;
        precio_base: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
