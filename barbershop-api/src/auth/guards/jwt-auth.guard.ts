// barbershop-api/src/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Kysely } from 'kysely';
import { DB } from '../../database/db.types';
import { DATABASE_TOKEN } from '../../database/database.provider';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>,
  ) {
    super();
  }

  /**
   * Este método es el corazón de nuestro guardia. Determina si una petición
   * puede continuar o no. Lo hemos hecho 'async' para poder consultar la base de datos.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero, verificamos si la ruta está marcada como @Public.
    // Si es pública, no necesitamos hacer ninguna validación de token.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    // Si la ruta NO es pública y NO hay token, rechazamos la petición inmediatamente.
    if (!token && !isPublic) {
      throw new UnauthorizedException('Se requiere un token de acceso.');
    }

    // Si hay un token, verificamos si está en nuestra lista negra.
    if (token) {
      const jti = this.getJtiFromToken(token);
      if (jti) {
        const isBlocked = await this.db
          .selectFrom('token_blocklist')
          .where('jti', '=', jti)
          .select('jti')
          .executeTakeFirst();
        
        // Si el token está en la lista negra, lo rechazamos.
        if (isBlocked) {
          throw new UnauthorizedException('Token inválido (revocado).');
        }
      }
    }

    // Si la ruta es pública y no hay token, o si el token no está bloqueado,
    // dejamos que el AuthGuard de Passport haga su validación estándar (firma, expiración).
    // Si esta validación falla, lanzará un error. Si tiene éxito, adjuntará el usuario
    // a la request y permitirá continuar. Para las rutas públicas sin token, esto no hará nada.
    try {
      // Intentamos activar la lógica de Passport. Si hay token, lo valida. Si no hay, no hace nada.
      await super.canActivate(context);
    } catch (error) {
      // Si la validación de Passport falla (ej. token expirado) y la ruta no es pública,
      // lanzamos el error.
      if (!isPublic) {
        throw error;
      }
    }
    
    // Si llegamos aquí, significa que o la ruta es pública o el token es válido y no está bloqueado.
    return true;
  }

  // Pequeño helper para extraer el token del encabezado de forma segura.
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  // Pequeño helper para decodificar el JTI del token sin verificar la firma.
  private getJtiFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.jti || null;
    } catch (e) {
      return null;
    }
  }
}
