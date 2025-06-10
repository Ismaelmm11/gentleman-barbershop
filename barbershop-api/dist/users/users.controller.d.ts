import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }>;
    findAll(): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
