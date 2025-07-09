import { IsOptional, IsString, IsIn, IsNumberString } from 'class-validator';

export class ClientAnalyticsQueryDto {
  @IsOptional()
  @IsIn(['total_visitas', 'gasto_total', 'fecha_ultima_visita'])
  @IsString()
  sortBy?: 'total_visitas' | 'gasto_total' | 'fecha_ultima_visita' = 'total_visitas';

  @IsOptional()
  @IsNumberString()
  limit?: string = '25'; // Límite por defecto
}