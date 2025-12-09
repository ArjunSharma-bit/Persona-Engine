import { BadRequestException, Controller, Get, Post, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { ReplayService } from "../services/replay.service";
import { replayStatus } from "../mapper/replay.status";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { ReplayQueryDto } from "../dto/replay-query.dto";
import { ReplayResponseDto } from "../dto/replay-response.dto";

@ApiTags("Replay")
@Controller("replay")
export class ReplayController {
    constructor(private readonly replayService: ReplayService) { }

    @Post()
    @ApiOperation({ summary: "Replay historical events with different modes" })
    @ApiQuery({ name: "from", type: String, required: true })
    @ApiQuery({ name: "to", type: String, required: true })
    @ApiQuery({
        name: "mode",
        required: false,
        example: "full",
        description: "full | recompute | patch | dry-run | triggers-only"
    })
    @ApiQuery({
        name: "eps",
        required: false,
        example: 300,
        description: "Events per second throttle limit"
    })
    @ApiResponse({ status: 200, description: "Replay completed" })
    @ApiResponse({ status: 400, description: "Invalid query parameters" })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async replay(@Query() query: ReplayQueryDto): Promise<ReplayResponseDto> {
        if (!query.from || !query.to)
            throw new BadRequestException("Missing 'from' or 'to' query params");

        const fromTs = Number(query.from);
        const toTs = Number(query.to);
        const epsNum = Number(query.eps);

        if (isNaN(fromTs) || isNaN(toTs)) {
            throw new BadRequestException("'from' and 'to' must be valid timestamps");
        }
        if (epsNum <= 0)
            throw new BadRequestException("'eps' must be greater than 0");

        const validModes = ["full", "recompute", "patch", "dry-run", "triggers-only"];
        if (!validModes.includes(query.mode))
            throw new BadRequestException(`Invalid mode '${query.mode}'. Allowed: ${validModes.join(", ")}`);

        return this.replayService.replayEvents(fromTs, toTs, query.mode, epsNum);
    }

    @Get("status")
    @ApiOperation({ summary: "Get replay engine status" })
    @ApiResponse({ status: 200 })
    status() {
        return replayStatus;
    }
}
