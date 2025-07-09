import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            password: string | null;
            nombre: string;
            apellidos: string;
            telefono: string;
            fecha_nacimiento: Date;
            username: string | null;
            id: number;
            rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
        };
    }>;
    logout(req: Request): Promise<{
        message: string;
    }>;
}
