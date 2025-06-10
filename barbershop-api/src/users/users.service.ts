// barbershop-api/src/users/users.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>) {}

  /**
   * Crea un nuevo usuario en la base de datos.
   */
  async create(createUserDto: CreateUserDto) {
    const { fecha_nacimiento, ...restOfDto } = createUserDto;

    // --- CORRECCIÓN ---
    // MySQL no soporta .returning(). Haremos un proceso de dos pasos.
    // 1. Insertar el usuario.
    const result = await this.db
      .insertInto('usuario')
      .values({
        ...restOfDto,
        fecha_nacimiento: new Date(fecha_nacimiento),
      })
      .executeTakeFirstOrThrow();

    // El objeto 'result' contiene el ID del usuario recién insertado.
    // Kysely lo devuelve como un BigInt, lo convertimos a número.
    const newUserId = Number(result.insertId);

    // 2. Usar ese ID para buscar y devolver el usuario completo.
    // ¡Reutilizamos nuestro propio método findOne que ya hace esto!
    return this.findOne(newUserId);
  }

  /**
   * Devuelve una lista de todos los usuarios.
   */
  async findAll() {
    const users = await this.db.selectFrom('usuario').selectAll().execute();
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Busca y devuelve un único usuario por su ID.
   */
  async findOne(id: number) {
    const user = await this.db
      .selectFrom('usuario')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Actualiza los datos de un usuario.
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const { fecha_nacimiento, ...restOfDto } = updateUserDto;
    const dataToUpdate: any = { ...restOfDto };
    if (fecha_nacimiento) {
      dataToUpdate.fecha_nacimiento = new Date(fecha_nacimiento);
    }
    
    // --- CORRECCIÓN ---
    // Tampoco podemos usar .returning() en el update.
    // 1. Actualizar la tabla.
    await this.db
      .updateTable('usuario')
      .set(dataToUpdate)
      .where('id', '=', id)
      .executeTakeFirst();
    
    // 2. Buscar y devolver el usuario con los datos ya actualizados.
    return this.findOne(id);
  }

  /**
   * Elimina un usuario de la base de datos.
   */
  async remove(id: number) {
    const result = await this.db
      .deleteFrom('usuario')
      .where('id', '=', id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      throw new NotFoundException(`No se pudo eliminar. Usuario con ID ${id} no encontrado.`);
    }
    
    return { message: `Usuario con ID ${id} eliminado correctamente.` };
  }
}
