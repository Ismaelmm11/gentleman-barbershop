// barbershop-api/src/appointments/dto/update-appointment.dto.ts
import { IsOptional, IsInt, IsPositive, IsNumber,  IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IsTimeIn5MinuteIntervals } from 'src/common/decorators/time-validation.decorator';
import { Type } from 'class-transformer';

export class UpdateAppointmentDto {

    @IsOptional()
    @IsInt()
    @IsPositive()
    id_barbero?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    id_cliente?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    id_servicio?: number;

    @IsOptional()
    @IsDateString()
    @IsTimeIn5MinuteIntervals()
    fecha_hora_inicio?: string;

    @IsOptional()
    @IsDateString()
    @IsTimeIn5MinuteIntervals()
    fecha_hora_fin?: string;

    @IsOptional()
    @IsEnum(['PENDIENTE', 'CERRADO', 'CANCELADO', 'DESCANSO'])
    @IsNotEmpty()
    estado?: 'PENDIENTE' | 'CERRADO' | 'CANCELADO' | 'DESCANSO';

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    precio_final?: number;

    @IsOptional()
    @IsString()
    titulo?: string;
}
