import { InjectRedis } from "@nestjs-modules/ioredis";
import { Controller, Delete, Get, InternalServerErrorException } from "@nestjs/common";
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

        return result.map(([messageId, fields]) => {
            let payloadObj = {}

            for (let i = 0; i < fields.length; i += 2) {
                if (fields[i] === 'payload') {
                    try { payloadObj = JSON.parse(fields[i + 1]) } catch (e) { }
                }
            }
            return { _id: messageId, payload: payloadObj }
        })
    }

    @Delete()
    @ApiOperation({ summary: 'Clear the Dead Letter Queue' })
    async clearDlq() {
        await this.redis.del("event_stream_dlq");
        return { success: true, message: 'DLQ cleared succesfully!' }
    }
}
