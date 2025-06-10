// barbershop-api/src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types'; // Necesitamos instalar @nestjs/mapped-types si no lo está
import { CreateUserDto } from './create-user.dto';

// No necesitamos reescribir todos los campos.
// PartialType(CreateUserDto) toma todas las reglas de CreateUserDto
// y las hace opcionales. ¡Es pura magia!
export class UpdateUserDto extends PartialType(CreateUserDto) {}
