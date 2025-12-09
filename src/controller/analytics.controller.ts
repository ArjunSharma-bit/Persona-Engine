import { Controller, Get, Param } from "@nestjs/common";
import { AnalyticsService } from "../services/analytics.service";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
    constructor(private readonly analysisService: AnalyticsService) { }

    @Get("counts")
    @ApiOperation({ summary: "Get count of events grouped by type" })
    @ApiResponse({ status: 200, description: "Counts returned" })
    countByType() {
        return this.analysisService.CountByType();
    }

    @Get("daily")
    @ApiOperation({ summary: "Get daily event count" })
    @ApiResponse({ status: 200 })
    dailyCount() {
        return this.analysisService.dailyCount();
    }

    @Get("categories")
    @ApiOperation({ summary: "Get top viewed categories" })
    @ApiResponse({ status: 200 })
    topCategories() {
        return this.analysisService.topCategories();
    }

    @Get("user/:id/timeline")
    @ApiOperation({ summary: "Get timeline of events for a user" })
    @ApiParam({ name: "id", type: String })
    @ApiResponse({ status: 200 })
    userTimeline(@Param("id") id: string) {
        return this.analysisService.userTimeline(id);
    }

    @Get("user/:id/funnel")
    @ApiOperation({ summary: "Get funnel breakdown for a user" })
    @ApiParam({ name: "id", type: String })
    @ApiResponse({ status: 200 })
    userFunnel(@Param("id") id: string) {
        return this.analysisService.funnel(id);
    }

    @Get("sql/daily-events")
    @ApiOperation({ summary: "Get SQL aggregated daily event data" })
    @ApiResponse({ status: 200 })
    getDailyEventsSql() {
        return this.analysisService.getSqlDailyEvents();
    }

    @Get("sql/categories")
    @ApiOperation({ summary: "Get SQL aggregated category stats" })
    @ApiResponse({ status: 200 })
    getCategorySql() {
        return this.analysisService.getSqlCategoryStats();
    }

    @Get("sql/revenue")
    @ApiOperation({ summary: "Get SQL aggregated daily revenue" })
    @ApiResponse({ status: 200 })
    getRevenueSql() {
        return this.analysisService.getSqlRevenue();
    }
}
