import { Controller, Get, Param } from "@nestjs/common";
import { AnalyticsService } from "../services/analytics.service";

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analysisService: AnalyticsService) { }

    @Get('counts')
    countByType() {
        return this.analysisService.CountByType();
    }

    @Get('daily')
    dailyCount() {
        return this.analysisService.dailyCount();
    }

    @Get('categories')
    topCategories() {
        return this.analysisService.topCategories();
    }

    @Get('user/:id/timeline')
    userTimeline(@Param('id') id: string) {
        return this.analysisService.userTimeline(id);
    }

    @Get('user/:id/funnel')
    userFunnel(@Param('id') id: string) {
        return this.analysisService.funnel(id);
    }
}