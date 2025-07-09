"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const database_provider_1 = require("../database/database.provider");
let AnalyticsService = class AnalyticsService {
    db;
    constructor(db) {
        this.db = db;
    }
    applyFilters(query, filters) {
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
    async getAggregatedStats(queryDto) {
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
    async getStatsPorDia(queryDto) {
        let query = this.db
            .selectFrom('v_analiticas_diarias_profesional')
            .select([
            'fecha',
            'profesional_id',
            'profesional_nombre',
            (0, kysely_1.sql) `SUM(total_citas_dia)`.as('total_citas'),
            (0, kysely_1.sql) `SUM(ingresos_diarios)`.as('total_ingresos'),
        ])
            .groupBy(['fecha', 'profesional_id', 'profesional_nombre'])
            .orderBy('fecha', 'asc');
        query = this.applyFilters(query, queryDto);
        const rows = await query.execute();
        return this.formatGroupedStats(rows, 'fecha');
    }
    async getStatsPorSemana(queryDto) {
        let query = this.db
            .selectFrom('v_analiticas_diarias_profesional')
            .select([
            'anio',
            'semana_del_anio',
            'profesional_id',
            'profesional_nombre',
            (0, kysely_1.sql) `SUM(total_citas_dia)`.as('total_citas'),
            (0, kysely_1.sql) `SUM(ingresos_diarios)`.as('total_ingresos'),
        ])
            .groupBy(['anio', 'semana_del_anio', 'profesional_id', 'profesional_nombre'])
            .orderBy(['anio', 'semana_del_anio']);
        query = this.applyFilters(query, queryDto);
        const rows = await query.execute();
        return this.formatGroupedStats(rows, 'semana_del_anio', 'anio');
    }
    async getStatsPorMes(queryDto) {
        let query = this.db
            .selectFrom('v_analiticas_diarias_profesional')
            .select([
            'anio',
            'mes',
            'profesional_id',
            'profesional_nombre',
            (0, kysely_1.sql) `SUM(total_citas_dia)`.as('total_citas'),
            (0, kysely_1.sql) `SUM(ingresos_diarios)`.as('total_ingresos'),
        ])
            .groupBy(['anio', 'mes', 'profesional_id', 'profesional_nombre'])
            .orderBy(['anio', 'mes']);
        query = this.applyFilters(query, queryDto);
        const rows = await query.execute();
        return this.formatGroupedStats(rows, 'mes', 'anio');
    }
    async getStatsPorAnio(queryDto) {
        let query = this.db
            .selectFrom('v_analiticas_diarias_profesional')
            .select([
            'anio',
            'profesional_id',
            'profesional_nombre',
            (0, kysely_1.sql) `SUM(total_citas_dia)`.as('total_citas'),
            (0, kysely_1.sql) `SUM(ingresos_diarios)`.as('total_ingresos'),
        ])
            .groupBy(['anio', 'profesional_id', 'profesional_nombre'])
            .orderBy(['anio']);
        query = this.applyFilters(query, queryDto);
        const rows = await query.execute();
        return this.formatGroupedStats(rows, 'anio');
    }
    formatGroupedStats(rows, ...groupKeys) {
        return rows.map(row => ({
            ...row,
            ticket_promedio: row.total_citas > 0 ? row.total_ingresos / row.total_citas : 0,
            group_key: groupKeys.map(k => row[k]).join('-')
        }));
    }
    async getClientRankings(queryDto) {
        const { sortBy = 'total_visitas', limit = '25' } = queryDto;
        return await this.db
            .selectFrom('v_analiticas_clientes')
            .selectAll()
            .orderBy(sortBy, 'desc')
            .limit(parseInt(limit))
            .execute();
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [kysely_1.Kysely])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map