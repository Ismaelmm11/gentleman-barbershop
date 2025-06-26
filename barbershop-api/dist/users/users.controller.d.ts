import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersQueryDto } from './dto/find-all-users-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, creator?: {
        userId: number;
        rol: string;
    }): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
        rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
    }>;
    changePassword(user: {
        userId: number;
    }, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<{
        message: string;
    }>;
    findAll(findAllUsersQueryDto: FindAllUsersQueryDto): Promise<{
        data: {
            id: number;
            nombre: string;
            apellidos: string;
            username: string | null;
            telefono: string;
            fecha_nacimiento: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            last_page: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
        rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: number;
        nombre: string;
        apellidos: string;
        username: string | null;
        telefono: string;
        fecha_nacimiento: Date;
        rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
