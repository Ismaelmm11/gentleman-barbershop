// barbershop-api/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Obtener los roles definidos por el decorador @Roles
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no se especifican roles, dejamos pasar
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // --- LÓGICA DEL SUPERUSUARIO ---
    // Si el rol del usuario que hace la petición es 'ADMIN',
    // le concedemos acceso inmediato sin más comprobaciones.
    if (user.rol === 'ADMIN') {
      return true;
    }
    // ---------------------------------

    // Si no es un ADMIN, procedemos con la comprobación normal.
    return requiredRoles.some((role) => user.rol === role);
  }
}
