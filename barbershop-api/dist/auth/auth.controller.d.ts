import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            nombre: string;
            apellidos: string;
            username: string | null;
            password: string | null;
            telefono: string;
            fecha_nacimiento: Date;
            rol: "ADMIN" | "BARBERO" | "TATUADOR" | "CLIENTE";
        };
    }>;
    logout(req: Request): Promise<{
        message: string;
    }>;
}
