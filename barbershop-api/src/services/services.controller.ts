// barbershop-api/src/services/services.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * @Controller('services') - Define esta clase como un controlador. Todas las rutas definidas aquí
 * estarán prefijadas con '/services'.
 * @UseGuards(JwtAuthGuard, RolesGuard) - Aplica los guardias de seguridad a TODAS las rutas
 * de este controlador. Primero, el JwtAuthGuard verifica que el token sea válido. Segundo,
 * el RolesGuard comprueba si el usuario tiene el rol permitido.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Endpoint para crear un nuevo servicio.
   * @Post() - Mapea las peticiones HTTP POST a '/services'.
   * @Roles('ADMIN', 'BARBERO') - Define los roles permitidos para esta ruta. Solo los usuarios
   * con rol 'ADMIN'
   * @Body() - Extrae el cuerpo de la petición y lo valida usando el CreateServiceDto.
   */
  @Post()
  @Roles('ADMIN')
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  /**
   * Endpoint para obtener todos los servicios.
   * @Public() - Marca esta ruta como pública. Nuestro JwtAuthGuard la ignorará,
   * permitiendo el acceso a cualquiera, incluso sin token.
   * @Get() - Mapea las peticiones HTTP GET a '/services'.
   */
  @Public()
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  /**
   * Endpoint para obtener un servicio específico por su ID.
   * @Public() - También es una ruta pública para que todos puedan ver los detalles de un servicio.
   * @Get(':id') - Mapea las peticiones GET a '/services/:id' (ej: /services/4).
   * @Param('id') - Extrae el 'id' de la URL para pasarlo como argumento.
   */
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  /**
   * Endpoint para actualizar un servicio existente.
   * @Patch(':id') - Mapea las peticiones HTTP PATCH a '/services/:id'.
   * @Roles('ADMIN', 'BARBERO') - Solo los 'ADMIN' y 'BARBERO' pueden modificar servicios.
   * @Body() - Extrae los datos a actualizar del cuerpo de la petición.
   */
  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  /**
   * Endpoint para eliminar un servicio.
   * @Delete(':id') - Mapea las peticiones HTTP DELETE a '/services/:id'.
   * @Roles('ADMIN', 'BARBERO') - Solo los 'ADMIN' y 'BARBERO' pueden eliminar servicios.
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
