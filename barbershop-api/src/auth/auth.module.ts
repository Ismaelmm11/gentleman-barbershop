// barbershop-api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport'; // ¡Importamos PassportModule!
import { JwtStrategy } from './strategies/jwt.strategy'; // ¡Importamos nuestra Estrategia!

@Module({
  imports: [
    UsersModule,
    // PassportModule registra la estrategia de autenticación por defecto (en nuestro caso, 'jwt').
    PassportModule,
    // Mantenemos la configuración asíncrona del JwtModule para cargar la clave secreta
    // de forma segura desde las variables de entorno.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  /**
   * Añadimos nuestra JwtStrategy a la lista de providers del módulo.
   * Esto le permite a NestJS instanciar nuestra estrategia y usarla
   * donde sea necesario, como en el AuthGuard.
   */
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
