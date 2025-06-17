// barbershop-api/src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Este decorador marca un endpoint como público.
 * El JwtAuthGuard buscará esta metadata para permitir el acceso
 * sin necesidad de un token JWT.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
