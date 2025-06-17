// barbershop-api/src/users/dto/update-profile.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsEnum(['ADMIN', 'BARBERO', 'TATUADOR', 'CLIENTE'])
  @IsNotEmpty()
  tipo_perfil: 'ADMIN' | 'BARBERO' | 'TATUADOR' | 'CLIENTE';
}