export declare class CreateUserDto {
    nombre: string;
    apellidos: string;
    telefono: string;
    fecha_nacimiento: string;
    username?: string;
    password?: string;
    tipo_perfil: 'ADMIN' | 'BARBERO' | 'TATUADOR' | 'CLIENTE';
}
