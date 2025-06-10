// barbershop-api/src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Este decorador marca la clase como un Controlador de NestJS.
 * El string 'users' define la ruta base para todos los endpoints de este controlador.
 * Todas las rutas aquí definidas colgarán de /users.
 */
@Controller('users')
export class UsersController {
  /**
   * El constructor inyecta las dependencias que necesita el controlador.
   * Aquí, estamos pidiendo a NestJS que nos "inyecte" una instancia de UsersService.
   * `private readonly` es una buena práctica para asegurar que el servicio
   * solo se pueda leer y no se modifique desde dentro del controlador.
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint para crear un nuevo usuario.
   * @Post() - Este decorador mapea las peticiones HTTP POST a /users a este método.
   * @Body() - Este decorador extrae el cuerpo (body) de la petición HTTP
   * y lo convierte en una instancia de CreateUserDto, validándolo en el proceso.
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // El controlador delega toda la lógica de creación al servicio.
    return this.usersService.create(createUserDto);
  }

  /**
   * Endpoint para obtener todos los usuarios.
   * @Get() - Mapea las peticiones HTTP GET a /users a este método.
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Endpoint para obtener un usuario específico por su ID.
   * @Get(':id') - Mapea las peticiones GET a /users/:id (ej: /users/123).
   * @Param('id') - Extrae el parámetro 'id' de la URL (el '123')
   * y lo pasa como argumento al método.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    // El '+' convierte el 'id' (que siempre llega como string) a un número.
    return this.usersService.findOne(+id);
  }

  /**
   * Endpoint para actualizar parcialmente un usuario.
   * @Patch(':id') - Mapea las peticiones PATCH a /users/:id.
   * PATCH es el verbo estándar para actualizaciones parciales.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  /**
   * Endpoint para eliminar un usuario.
   * @Delete(':id') - Mapea las peticiones DELETE a /users/:id.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
