// barbershop-api/src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersQueryDto } from './dto/find-all-users-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RolesGuard } from '../auth/guards/roles.guard'; // 
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Este decorador marca la clase como un Controlador de NestJS.
 * El string 'users' define la ruta base para todos los endpoints de este controlador.
 * Todas las rutas aquí definidas colgarán de /users.
 * Aplicamos nuestro guardia inteligente a nivel de controlador.
 * TODAS las rutas estarán protegidas por defecto.
 * */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  /**
   * El constructor inyecta las dependencias que necesita el controlador.
   * Aquí, estamos pidiendo a NestJS que nos "inyecte" una instancia de UsersService.
   * `private readonly` es una buena práctica para asegurar que el servicio
   * solo se pueda leer y no se modifique desde dentro del controlador.
   */
  constructor(private readonly usersService: UsersService) { }

  /**
   * Endpoint para crear un nuevo usuario.
   * @Public()- Este decorador sirve para marcar esta ruta específica como pública. El JwtAuthGuard verá esto y permitirá el acceso
   * sin necesidad de un token.
   * @Post() - Este decorador mapea las peticiones HTTP POST a /users a este método.
   * @Body() - Este decorador extrae el cuerpo (body) de la petición HTTP
   * y lo convierte en una instancia de CreateUserDto, validándolo en el proceso.
   */
  @Public()
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @GetUser() creator?: { userId: number; rol: string }) {
    // El controlador delega toda la lógica de creación al servicio.
    return this.usersService.create(createUserDto, creator);
  }

  /**
   * Endpoint para que un usuario autenticado cambie su propia contraseña.
   * @Patch(':id') - Mapea las peticiones PATCH a /users/:id.
   * @param user El objeto de usuario extraído del token JWT por nuestro decorador @GetUser.
   * @param changePasswordDto DTO con la contraseña antigua y la nueva.
   */
  @Patch('change-password')
  changePassword(
    @GetUser() user: { userId: number },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.userId, changePasswordDto);
  }

  /**
   * Endpoint para cambiar el perfil (rol) de un usuario específico.
   * @Patch(':id') - Mapea las peticiones PATCH a /users/:id.
   * @Roles('ADMIN') - El Guardia solo deja pasar a usuarios con el rol de AMDIN.
   * Nota: En un futuro, esta ruta debería estar protegida por un RolesGuard (ej: solo para ADMINs).
   * @param id El ID del usuario cuyo perfil se va a modificar.
   * @param updateProfileDto DTO con el nuevo tipo de perfil.
   */
  @Patch(':id/profile')
  @Roles('ADMIN')
  updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(+id, updateProfileDto);
  }

  /**
   * Endpoint para obtener todos los usuarios.
   * @Get() - Mapea las peticiones HTTP GET a /users a este método.
   */
  @Get()
  findAll(@Query() findAllUsersQueryDto: FindAllUsersQueryDto) {
    return this.usersService.findAll(findAllUsersQueryDto);
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
