// barbershop-api/src/services/services.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>) {}

  /**
   * Crea un nuevo servicio en la base de datos.
   * @param createServiceDto Los datos para el nuevo servicio.
   * @returns El servicio recién creado.
   */
  async create(createServiceDto: CreateServiceDto) {
    const result = await this.db
      .insertInto('servicio')
      .values(createServiceDto)
      .executeTakeFirstOrThrow();
      
    const newServiceId = Number(result.insertId);
    return this.findOne(newServiceId);
  }

  /**
   * Devuelve una lista de todos los servicios.
   * @returns Un array con todos los servicios.
   */
  async findAll() {
    return this.db.selectFrom('servicio').selectAll().execute();
  }

  /**
   * Busca y devuelve un único servicio por su ID.
   * @param id El ID del servicio a buscar.
   * @returns El servicio encontrado.
   * @throws NotFoundException si el servicio no se encuentra.
   */
  async findOne(id: number) {
    const service = await this.db
      .selectFrom('servicio')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!service) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado.`);
    }
    return service;
  }

  /**
   * Actualiza los datos de un servicio.
   * @param id El ID del servicio a actualizar.
   * @param updateServiceDto Los campos a actualizar.
   * @returns El servicio actualizado.
   */
  async update(id: number, updateServiceDto: UpdateServiceDto) {
    await this.db
      .updateTable('servicio')
      .set(updateServiceDto)
      .where('id', '=', id)
      .executeTakeFirstOrThrow();
      
    return this.findOne(id);
  }

  /**
   * Elimina un servicio de la base de datos.
   * @param id El ID del servicio a eliminar.
   * @returns Un mensaje de confirmación.
   */
  async remove(id: number) {
    const result = await this.db
      .deleteFrom('servicio')
      .where('id', '=', id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      throw new NotFoundException(`No se pudo eliminar. Servicio con ID ${id} no encontrado.`);
    }

    return { message: `Servicio con ID ${id} eliminado correctamente.` };
  }
}
