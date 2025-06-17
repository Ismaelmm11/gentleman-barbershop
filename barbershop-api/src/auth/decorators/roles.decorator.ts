// barbershop-api/src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
    
// Define una constante con la clave que se usará para almacenar los roles en los metadatos
export const ROLES_KEY = 'roles';

// Define un decorador personalizado llamado 'Roles'
// Este decorador puede recibir uno o más roles como argumentos (por ejemplo, 'admin', 'user')
// y asocia esos roles como metadatos a un controlador o método específico
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
    