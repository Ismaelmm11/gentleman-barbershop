// barbershop-api/src/users/dto/create-user.dto.ts
import {
    IsString,
    IsNotEmpty,
    IsPhoneNumber,
    IsDateString,
    IsOptional,
  } from 'class-validator';
  
  // Esta clase define la "forma" de los datos que se esperan
  // cuando se crea un nuevo usuario. Los decoradores se encargan
  // de validar que cada campo cumpla con las reglas.
  export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;
  
    @IsString()
    @IsNotEmpty()
    apellidos: string;
  
    @IsPhoneNumber('ES') // Valida que sea un número de teléfono válido en España.
    telefono: string;
  
    @IsDateString()
    fecha_nacimiento: string; // Recibimos la fecha como un string 'YYYY-MM-DD'
  
    @IsString()
    @IsOptional() // El username es opcional por ahora.
    username?: string;
  
    @IsString()
    @IsOptional() // La contraseña es opcional por ahora.
    password?: string;
  }
  