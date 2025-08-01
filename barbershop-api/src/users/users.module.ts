// barbershop-api/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RecurringBlocksModule } from '../recurring-blocks/recurring-blocks.module';
  

/**
 * El decorador @Module() define la clase como un módulo de NestJS.
 * Los módulos son la unidad fundamental de organización en NestJS.
 * Agrupan un conjunto de funcionalidades relacionadas.
 */
@Module({
  /**
   * Importamos el RecurringBlocksModule para que los proveedores de este
   * módulo (en este caso, UsersService) puedan inyectar y utilizar
   * los servicios exportados por RecurringBlocksModule.
   */
  imports: [RecurringBlocksModule],
  /**
   * La propiedad 'controllers' registra todos los controladores
   * que pertenecen a este módulo. En este caso, solo UsersController.
   */
  controllers: [UsersController],
  /**
   * La propiedad 'providers' registra todos los servicios (o proveedores)
   * que este módulo define. La instancia de UsersService estará disponible
   * para ser inyectada en cualquier componente de este módulo (como el controlador).
   */
  providers: [UsersService],
  /**
   * También existe una propiedad 'exports' que se usaría si quisiéramos
   * que el UsersService estuviera disponible para otros módulos que importen UsersModule.
   */
  exports: [UsersService],
})
export class UsersModule {}
