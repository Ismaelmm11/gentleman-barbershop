// barbershop-api/src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * CORRECCIÓN: Se reestructura el constructor para validar la existencia
   * de la clave secreta antes de usarla, solucionando el error de TypeScript.
   */
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    // Esta validación es crucial. Si la clave secreta no está en el .env,
    // la aplicación lanzará un error al arrancar, evitando ejecutarse
    // en un estado inseguro.
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno.');
    }

    super({
      // Le decimos a la estrategia que extraiga el token del encabezado
      // 'Authorization' como un "Bearer Token".
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Le decimos que NO ignore los tokens expirados. La propia librería
      // se encargará de rechazarlo si ha caducado.
      ignoreExpiration: false,
      // Ahora, TypeScript sabe que 'secret' es definitivamente un string.
      secretOrKey: secret,
    });
  }

  /**
   * Este método se ejecuta automáticamente una vez que la estrategia
   * ha verificado que el token es válido y no ha expirado.
   * @param payload El contenido del token que nosotros mismos definimos.
   * @returns Un objeto que NestJS adjuntará al objeto `request` (como `req.user`).
   */
  async validate(payload: any) {
    // Aquí podemos devolver el payload completo o solo una parte.
    // Devolver esto nos permitirá acceder a `req.user.sub`, `req.user.username`, `req.user.rol`
    // en nuestras rutas protegidas.
    return { userId: payload.sub, username: payload.username, rol: payload.rol };
  }
}
