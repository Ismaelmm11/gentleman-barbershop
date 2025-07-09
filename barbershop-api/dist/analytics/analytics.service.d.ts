import { Kysely } from 'kysely';
import { DB } from 'src/database/db.types';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { ClientAnalyticsQueryDto } from './dto/client-analytics-query.dto';
export declare class AnalyticsService {
    private readonly db;
    constructor(db: Kysely<DB>);
    private applyFilters;
    getAggregatedStats(queryDto: AnalyticsQueryDto): Promise<any[]>;
    private getStatsPorDia;
    private getStatsPorSemana;
    private getStatsPorMes;
    private getStatsPorAnio;
    private formatGroupedStats;
    getClientRankings(queryDto: ClientAnalyticsQueryDto): Promise<{
        id_cliente: number;
        total_visitas: number;
        gasto_total: number;
        fecha_ultima_visita: string;
        nombre_completo_cliente: string;
        gasto_promedio_por_visita: number;
        fecha_primera_visita: string;
    }[]>;
}
