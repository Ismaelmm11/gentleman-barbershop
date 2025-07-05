// src/products/products.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllProductsQueryDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Controlador para gestionar los productos de la tienda.
 * La ruta base para todos los endpoints de este controlador es /products.
 * Se aplican los guardias de autenticación (JwtAuthGuard) y roles (RolesGuard)
 * a nivel de controlador, por lo que todas las rutas están protegidas por defecto.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  /**
   * El constructor inyecta la dependencia del ProductsService.
   * NestJS se encarga de proporcionar una instancia de ProductsService
   * que puede ser utilizada dentro de este controlador.
   */
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Endpoint para crear un nuevo producto.
   * @Post() - Mapea las peticiones HTTP POST a /products.
   * @Roles(Role.ADMIN) - Restringe el acceso de esta ruta exclusivamente a usuarios con el rol de 'ADMIN'.
   * @Body() createProductDto - Extrae y valida el cuerpo de la petición.
   */
  @Post()
  @Roles('ADMIN')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * Endpoint para obtener un listado de todos los productos, con filtros y paginación.
   * @Public() - Marca esta ruta como pública, permitiendo el acceso sin token.
   * @Get() - Mapea las peticiones HTTP GET a /products.
   * @Query() query - Extrae los parámetros de consulta de la URL (ej: /products?limit=5&page=1).
   */
  @Public()
  @Get()
  findAll(@Query() query: FindAllProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  /**
   * Endpoint para obtener un producto específico por su ID.
   * @Public() - Marca esta ruta como pública.
   * @Get(':id') - Mapea las peticiones GET a /products/:id.
   * @Param('id', ParseIntPipe) - Extrae el 'id' de la URL y usa ParseIntPipe para
   * asegurar que es un número entero válido antes de pasarlo al método.
   */
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  /**
   * Endpoint para actualizar parcialmente un producto.
   * @Patch(':id') - Mapea las peticiones PATCH a /products/:id.
   * @Roles(Role.ADMIN) - Restringe el acceso a los administradores.
   * @Param('id', ParseIntPipe) - Valida y extrae el ID del producto a actualizar.
   * @Body() updateProductDto - Extrae y valida los datos a actualizar del cuerpo de la petición.
   */
  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * Endpoint para eliminar un producto.
   * @Delete(':id') - Mapea las peticiones DELETE a /products/:id.
   * @Roles(Role.ADMIN) - Restringe el acceso a los administradores.
   * @Param('id', ParseIntPipe) - Valida y extrae el ID del producto a eliminar.
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}