    // barbershop-api/src/appointments/appointments.module.ts
    import { Module } from '@nestjs/common';
    import { AppointmentsService } from './appointments.service';
    import { AppointmentsController } from './appointments.controller';
    import { UsersModule } from '../users/users.module';
    import { ServicesModule } from '../services/services.module';

    @Module({
      // Importamos los módulos cuyos servicios vamos a necesitar.
      imports: [UsersModule, ServicesModule],
      controllers: [AppointmentsController],
      providers: [AppointmentsService],
    })
    export class AppointmentsModule {}
    