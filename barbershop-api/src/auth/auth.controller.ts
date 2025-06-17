// barbershop-api/src/auth/auth.controller.ts
import { Controller, Post, Body, Req, HttpCode, HttpStatus, UseGuards, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginDto: LoginDto) {
    // Llamamos al nuevo método 'login' del servicio.
    return this.authService.login(loginDto.username, loginDto.password);
  }

  /**
  * Endpoint para cerrar sesión. Requiere un token válido.
  */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: Request) {
    const authHeader = req.headers.authorization;

    // CORRECCIÓN: Verificamos que el encabezado de autorización existe
    // y que empieza con "Bearer ", que es el estándar para JWT.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Formato de token de autorización inválido.');
    }

    // Si el encabezado es válido, extraemos el token de forma segura.
    const token = authHeader.split(' ')[1];
    return this.authService.logout(token);
  }
}
