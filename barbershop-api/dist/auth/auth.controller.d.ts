import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    logout(req: Request): Promise<{
        message: string;
    }>;
}
