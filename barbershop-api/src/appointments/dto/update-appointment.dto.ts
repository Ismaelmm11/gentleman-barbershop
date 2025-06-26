// barbershop-api/src/appointments/dto/update-appointment.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateAppointmentDto {
    @IsEnum(['PENDIENTE', 'CERRADO', 'CANCELADO', 'DESCANSO'])
    @IsNotEmpty()
    estado: 'PENDIENTE' | 'CERRADO' | 'CANCELADO' | 'DESCANSO';
}
