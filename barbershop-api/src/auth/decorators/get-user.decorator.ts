// barbershop-api/src/auth/decorators/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Este decorador personalizado extrae el objeto `user` que el JwtAuthGuard
 * ha adjuntado a la petición. Nos permite obtener al usuario autenticado
 * de forma limpia en nuestros controladores.
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
