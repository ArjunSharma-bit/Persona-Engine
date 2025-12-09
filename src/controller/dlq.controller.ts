import { InjectRedis } from "@nestjs-modules/ioredis";
import { Controller, Get, InternalServerErrorException } from "@nestjs/common";
import Redis from "ioredis";
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from "@nestjs/swagger";
import { DlqEventDto } from "../dto/dlq.response.dto";

@ApiTags("DLQ")
@Controller("dlq")
export class DlqController {
    constructor(@InjectRedis() private readonly redis: Redis) { }

    @Get()
    @ApiOperation({ summary: "Get all events from the Dead Letter Queue" })
    @ApiResponse({ status: 200, description: "List of failed events" })
    @ApiOkResponse({
        description: "List of DLQ events",
        type: DlqEventDto,
        isArray: true
    })
    async getDlq() {
        const result = await this.redis.xrange("event_stream_dlq", "-", "+");
        if (!result) throw new InternalServerErrorException("DLQ read failed")
        return result;
    }
}
