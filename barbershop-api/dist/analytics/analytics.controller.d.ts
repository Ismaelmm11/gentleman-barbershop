import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { ClientAnalyticsQueryDto } from './dto/client-analytics-query.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getAnalyticsSummary(queryDto: AnalyticsQueryDto): Promise<any[]>;
    getClientAnalytics(queryDto: ClientAnalyticsQueryDto): Promise<{
        id_cliente: number;
        total_visitas: number;
        gasto_total: number;
        fecha_ultima_visita: string;
        nombre_completo_cliente: string;
        gasto_promedio_por_visita: number;
        fecha_primera_visita: string;
    }[]>;
}
