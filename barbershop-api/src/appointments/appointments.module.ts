// barbershop-api/src/appointments/appointments.module.ts
import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { UsersModule } from '../users/users.module';
import { ServicesModule } from '../services/services.module';
import { RecurringBlocksModule } from '../recurring-blocks/recurring-blocks.module'; // 1. IMPORTAR
import { MessagingModule } from 'src/messaging/messaging.module';

@Module({
  // Importamos los módulos cuyos servicios vamos a necesitar.
  // Ahora AppointmentsService podrá usar UsersService, ServicesService
  // y, crucialmente, RecurringBlocksService.
  imports: [UsersModule, ServicesModule, RecurringBlocksModule, MessagingModule], // 2. AÑADIR A LA LISTA
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
