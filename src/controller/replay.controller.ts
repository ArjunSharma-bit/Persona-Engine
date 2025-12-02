import { Controller, Get, Post, Query } from "@nestjs/common";
import { ReplayService } from "../services/replay.service";
import { replayStatus } from "../mapper/replay.status";

@Controller('replay')
export class ReplayController {
    constructor(private readonly replayService: ReplayService) { }

    @Post()
    async replay(
        @Query('from') from: string,
        @Query('to') to: string,
        @Query('mode') mode = 'full',
        @Query('eps') eps = '300'
    ) {
        if (from === undefined || to === undefined) return { error: "Mising 'from' or 'to' query params" };

        const fromTs = Number(from);
        const toTs = Number(to);
        const epsNum = Number(eps)
        if (isNaN(fromTs) || isNaN(toTs)) return { error: "'from' and 'to' must be valid timestamps" }

        return this.replayService.replayEvents(fromTs, toTs, mode, epsNum)
    }

    @Get('status')
    status() {
        return replayStatus
    }
}