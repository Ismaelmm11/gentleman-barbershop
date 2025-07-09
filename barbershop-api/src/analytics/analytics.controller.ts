// src/analytics/analytics.controller.ts
import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { ClientAnalyticsQueryDto } from './dto/client-analytics-query.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'BARBERO', 'TATUADOR')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('summary')
  getAnalyticsSummary(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    queryDto: AnalyticsQueryDto
  ) {
    return this.analyticsService.getAggregatedStats(queryDto);
  }

  @Get('clientes')
  getClientAnalytics(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    queryDto: ClientAnalyticsQueryDto
  ) {
    return this.analyticsService.getClientRankings(queryDto);
  }
}