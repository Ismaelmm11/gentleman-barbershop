// src/analytics/dto/analytics-query.dto.ts
import { IsOptional, IsString, Matches, IsNumberString, IsIn } from 'class-validator';

export class AnalyticsQueryDto {
  // Nuevo filtro para la agrupación
  @IsOptional()
  @IsIn(['dia', 'semana', 'mes', 'anio'])
  group_by?: 'dia' | 'semana' | 'mes' | 'anio';

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  fecha_desde?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  fecha_hasta?: string;

  @IsOptional()
  @IsNumberString()
  mes?: string;
  
  @IsOptional()
  @IsNumberString()
  anio?: string;

  @IsOptional()
  @IsNumberString()
  profesional_id?: string;
}