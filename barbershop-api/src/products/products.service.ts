// src/products/products.service.ts
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllProductsQueryDto } from './dto/query-product.dto';
import { BrandsService } from 'src/brands/brands.service';
import { CategoriesService } from 'src/categories/categories.service';
import { In } from 'typeorm';


@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>,
    // Descomenta estas líneas cuando los servicios de Marcas y Categorías estén listos e importados en el ProductsModule.
    
    @Inject(forwardRef(() => BrandsService))
    private readonly brandsService: BrandsService,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const { media, id_marca, id_categoria, ...productData } = createProductDto;

    // --- Validación de Entidades Relacionadas ---
    // ANTES de siquiera empezar la transacción, validamos que la marca y categoría existan.
    // NOTA: Descomenta estas validaciones cuando los servicios correspondientes estén inyectados.
    await this.brandsService.findOne(id_marca);
    await this.categoriesService.findOne(id_categoria);

    // --- Validación de Duplicados ---
    const existingProduct = await this.db
      .selectFrom('producto')
      .select('id')
      .where('nombre', '=', productData.nombre)
      .executeTakeFirst();

    if (existingProduct) {
      throw new ConflictException('Ya existe un producto con este nombre.');
    }

    if (!media || media.length === 0) {
      throw new BadRequestException('Se requiere al menos un medio (imagen o video) para crear un producto.');
    }

    // --- Transacción de Creación ---
    const newProduct = await this.db.transaction().execute(async (trx) => {
      // 1. Insertar el producto principal
      const result = await trx
        .insertInto('producto')
        .values({
          ...productData,
          id_marca,
          id_categoria,
        })
        .executeTakeFirstOrThrow();

      const newProductId = Number(result.insertId);

      // 2. Insertar los medios asociados
      const mediaValues = media.map((m) => ({
        id_producto: newProductId,
        url: m.url,
        tipo: m.tipo,
        es_principal: m.es_principal,
      }));

      await trx.insertInto('media').values(mediaValues).execute();

      return newProductId;
    });

    // 3. Devolver el producto recién creado con todos sus datos
    return this.findOne(newProduct);
  }

  async findAll(query: FindAllProductsQueryDto) {
    const { limit = 10, page = 1, nombre, id_marca, id_categoria } = query;

    let queryBuilder = this.db.selectFrom('producto').selectAll();

    if (nombre) {
      queryBuilder = queryBuilder.where('nombre', 'like', `%${nombre}%`);
    }
    if (id_marca) {
      queryBuilder = queryBuilder.where('id_marca', '=', id_marca);
    }
    if (id_categoria) {
      queryBuilder = queryBuilder.where('id_categoria', '=', id_categoria);
    }

    const products = await queryBuilder
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    // --- ¡NUEVO CÓDIGO AQUÍ! ---
    // Para cada producto, obtener sus medios asociados
    const productsWithMedia = await Promise.all(
      products.map(async (product) => {
        const media = await this.db
          .selectFrom('media')
          .selectAll()
          .where('id_producto', '=', product.id)
          .execute();
        return { ...product, media };
      })
    );
    // --- FIN NUEVO CÓDIGO ---

    return {
      data: productsWithMedia, // Devolvemos los productos con sus medios
      total: products.length, // Esto no es el total real, solo de la página. Para un total real necesitarías una consulta COUNT
      page,
      limit,
    };
  }

  async findOne(id: number) {
    // Buscamos el producto
    const product = await this.db
      .selectFrom('producto')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    // Buscamos sus medios asociados
    const media = await this.db
      .selectFrom('media')
      .selectAll()
      .where('id_producto', '=', id)
      .execute();

    // Devolvemos el producto junto a sus medios
    return { ...product, media };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // Nos aseguramos de que el producto exista.
    await this.findOne(id);

    const { 
      media_a_anadir, 
      media_ids_a_eliminar, 
      ...productDataToUpdate 
    } = updateProductDto;

    await this.db.transaction().execute(async (trx) => {
      // 1. Actualizamos los datos principales del producto (SI HAY DATOS VÁLIDOS).
      
      // Filtramos el objeto para quedarnos solo con las propiedades
      // que no son undefined.
      const dataToUpdate = Object.entries(productDataToUpdate).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Ahora, la comprobación es sobre el objeto ya limpio.
      if (Object.keys(dataToUpdate).length > 0) {
        await trx
          .updateTable('producto')
          .set(dataToUpdate) // Usamos el objeto limpio
          .where('id', '=', id)
          .execute();
      }

      // 2. Eliminamos los medios especificados (esta lógica ya era correcta).
      if (media_ids_a_eliminar && media_ids_a_eliminar.length > 0) {
        await trx
          .deleteFrom('media')
          .where('id_producto', '=', id)
          .where('id', 'in', media_ids_a_eliminar)
          .execute();
      }

      // 3. Añadimos los nuevos medios especificados (esta lógica ya era correcta).
      if (media_a_anadir && media_a_anadir.length > 0) {
        const mediaValues = media_a_anadir.map((m) => ({
          id_producto: id,
          url: m.url,
          tipo: m.tipo,
          es_principal: m.es_principal,
        }));
  
        await trx.insertInto('media').values(mediaValues).execute();
      }
    });

    // Devolvemos el estado final del producto con todos los cambios aplicados.
    return this.findOne(id);
  }

  async remove(id: number) {
    // Verificamos que el producto existe antes de intentar borrarlo.
    const productToDelete = await this.findOne(id);

    const result = await this.db
      .deleteFrom('producto')
      .where('id', '=', id)
      .executeTakeFirst();

    // La tabla 'media' tiene ON DELETE CASCADE, por lo que la base de datos
    // borrará automáticamente todos los medios asociados.

    if (result.numDeletedRows === 0n) {
      throw new NotFoundException(`No se pudo eliminar el producto con ID ${id} porque no fue encontrado.`);
    }

    return { message: `Producto "${productToDelete.nombre}" eliminado con éxito.` };
  }
}