// barbershop-api/src/brands/brands.service.ts
import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>) {}

  async create(createBrandDto: CreateBrandDto) {
    // Comprobar si ya existe una marca con ese nombre
    const existingBrand = await this.db
      .selectFrom('marca')
      .select('id')
      .where('nombre', '=', createBrandDto.nombre)
      .executeTakeFirst();

    if (existingBrand) {
      throw new ConflictException(`La marca con el nombre '${createBrandDto.nombre}' ya existe.`);
    }

    const result = await this.db
      .insertInto('marca')
      .values(createBrandDto)
      .executeTakeFirstOrThrow();
    
    return this.findOne(Number(result.insertId));
  }

  async findAll() {
    return this.db.selectFrom('marca').selectAll().orderBy('nombre', 'asc').execute();
  }

  async findOne(id: number) {
    const brand = await this.db
      .selectFrom('marca')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    
    if (!brand) {
      throw new NotFoundException(`Marca con ID ${id} no encontrada.`);
    }
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    await this.findOne(id); // Asegurarse de que la marca existe

    if (updateBrandDto.nombre) {
      const existingBrand = await this.db
        .selectFrom('marca')
        .select('id')
        .where('nombre', '=', updateBrandDto.nombre)
        .where('id', '!=', id) // Excluir la propia marca que estamos actualizando
        .executeTakeFirst();

      if (existingBrand) {
        throw new ConflictException(`La marca con el nombre '${updateBrandDto.nombre}' ya existe.`);
      }
    }

    await this.db
      .updateTable('marca')
      .set(updateBrandDto)
      .where('id', '=', id)
      .execute();
      
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id); // Asegurarse de que la marca existe
    
    try {
      await this.db.deleteFrom('marca').where('id', '=', id).execute();
      return { message: `Marca con ID ${id} eliminada correctamente.` };
    } catch (error) {
      // Capturar el error de clave foránea si la marca está en uso
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException('No se puede eliminar la marca porque está siendo utilizada por uno o más productos.');
      }
      throw error;
    }
  }
}
