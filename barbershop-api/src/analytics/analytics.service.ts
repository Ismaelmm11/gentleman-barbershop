// src/analytics/analytics.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { DB } from 'src/database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { ClientAnalyticsQueryDto } from './dto/client-analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>) { }

  private applyFilters(query: any, filters: AnalyticsQueryDto) {
    if (filters.fecha_desde) {
      query = query.where('fecha', '>=', filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      query = query.where('fecha', '<=', filters.fecha_hasta);
    }
    if (filters.mes) {
      query = query.where('mes', '=', parseInt(filters.mes));
    }
    if (filters.anio) {
      query = query.where('anio', '=', parseInt(filters.anio));
    }
    if (filters.profesional_id) {
      query = query.where('profesional_id', '=', parseInt(filters.profesional_id));
    }
    return query;
  }

  // En src/analytics/analytics.service.ts

  async getAggregatedStats(queryDto: AnalyticsQueryDto) {
    const groupBy = queryDto.group_by || 'dia';

    switch (groupBy) {
      case 'semana':
        return this.getStatsPorSemana(queryDto);
      case 'mes':
        return this.getStatsPorMes(queryDto);
      case 'anio':
        return this.getStatsPorAnio(queryDto);
      case 'dia':
      default:
        return this.getStatsPorDia(queryDto);
    }
  }

  private async getStatsPorDia(queryDto: AnalyticsQueryDto) {
    let query = this.db
      .selectFrom('v_analiticas_diarias_profesional')
      .select([
        'fecha',
        'profesional_id',
        'profesional_nombre',
        sql<number>`SUM(total_citas_dia)`.as('total_citas'),
        sql<number>`SUM(ingresos_diarios)`.as('total_ingresos'),
      ])
      .groupBy(['fecha', 'profesional_id', 'profesional_nombre'])
      .orderBy('fecha', 'asc');

    query = this.applyFilters(query, queryDto);

    const rows = await query.execute();

    return this.formatGroupedStats(rows, 'fecha');
  }

  private async getStatsPorSemana(queryDto: AnalyticsQueryDto) {
    let query = this.db
      .selectFrom('v_analiticas_diarias_profesional')
      .select([
        'anio',
        'semana_del_anio',
        'profesional_id',
        'profesional_nombre',
        sql<number>`SUM(total_citas_dia)`.as('total_citas'),
        sql<number>`SUM(ingresos_diarios)`.as('total_ingresos'),
      ])
      .groupBy(['anio', 'semana_del_anio', 'profesional_id', 'profesional_nombre'])
      .orderBy(['anio', 'semana_del_anio']);

    query = this.applyFilters(query, queryDto);

    const rows = await query.execute();

    return this.formatGroupedStats(rows, 'semana_del_anio', 'anio');
  }

  private async getStatsPorMes(queryDto: AnalyticsQueryDto) {
    let query = this.db
      .selectFrom('v_analiticas_diarias_profesional')
      .select([
        'anio',
        'mes',
        'profesional_id',
        'profesional_nombre',
        sql<number>`SUM(total_citas_dia)`.as('total_citas'),
        sql<number>`SUM(ingresos_diarios)`.as('total_ingresos'),
      ])
      .groupBy(['anio', 'mes', 'profesional_id', 'profesional_nombre'])
      .orderBy(['anio', 'mes']);

    query = this.applyFilters(query, queryDto);

    const rows = await query.execute();

    return this.formatGroupedStats(rows, 'mes', 'anio');
  }

  private async getStatsPorAnio(queryDto: AnalyticsQueryDto) {
    let query = this.db
      .selectFrom('v_analiticas_diarias_profesional')
      .select([
        'anio',
        'profesional_id',
        'profesional_nombre',
        sql<number>`SUM(total_citas_dia)`.as('total_citas'),
        sql<number>`SUM(ingresos_diarios)`.as('total_ingresos'),
      ])
      .groupBy(['anio', 'profesional_id', 'profesional_nombre'])
      .orderBy(['anio']);

    query = this.applyFilters(query, queryDto);

    const rows = await query.execute();

    return this.formatGroupedStats(rows, 'anio');
  }


  private formatGroupedStats(rows: any[], ...groupKeys: string[]) {
    return rows.map(row => ({
      ...row,
      ticket_promedio: row.total_citas > 0 ? row.total_ingresos / row.total_citas : 0,
      group_key: groupKeys.map(k => row[k]).join('-') // ej: "2024-07", "2024-27", etc.
    }));
  }


  async getClientRankings(queryDto: ClientAnalyticsQueryDto) {
    // Asignamos valores por defecto aquí mismo usando desestructuración.
    // Si queryDto.sortBy no existe, usará 'total_visitas'.
    // Si queryDto.limit no existe, usará '25'.
    // Esto soluciona ambos errores de TypeScript de un solo golpe.
    const { sortBy = 'total_visitas', limit = '25' } = queryDto;

    return await this.db
      .selectFrom('v_analiticas_clientes')
      .selectAll()
      .orderBy(sortBy, 'desc') // Ordenamos por el criterio elegido, de mayor a menor
      .limit(parseInt(limit))    // Limitamos el número de resultados
      .execute();
  }
}