// barbershop-api/src/categories/categories.service.ts
import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.db
      .selectFrom('categoria')
      .select('id')
      .where('nombre', '=', createCategoryDto.nombre)
      .executeTakeFirst();

    if (existingCategory) {
      throw new ConflictException(`La categoría con el nombre '${createCategoryDto.nombre}' ya existe.`);
    }

    const result = await this.db
      .insertInto('categoria')
      .values(createCategoryDto)
      .executeTakeFirstOrThrow();
    
    return this.findOne(Number(result.insertId));
  }

  async findAll() {
    return this.db.selectFrom('categoria').selectAll().orderBy('nombre', 'asc').execute();
  }

  async findOne(id: number) {
    const category = await this.db
      .selectFrom('categoria')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada.`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    if (updateCategoryDto.nombre) {
      const existingCategory = await this.db
        .selectFrom('categoria')
        .select('id')
        .where('nombre', '=', updateCategoryDto.nombre)
        .where('id', '!=', id)
        .executeTakeFirst();

      if (existingCategory) {
        throw new ConflictException(`La categoría con el nombre '${updateCategoryDto.nombre}' ya existe.`);
      }
    }

    await this.db
      .updateTable('categoria')
      .set(updateCategoryDto)
      .where('id', '=', id)
      .execute();
      
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    
    try {
      await this.db.deleteFrom('categoria').where('id', '=', id).execute();
      return { message: `Categoría con ID ${id} eliminada correctamente.` };
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException('No se puede eliminar la categoría porque está siendo utilizada por uno o más productos.');
      }
      throw error;
    }
  }
}
