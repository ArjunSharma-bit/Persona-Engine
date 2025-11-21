import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
@Injectable()
export class EventService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
    ) { }

    async ingestEvent(event: any) {
        const payload = {
            userId: event.userId,
            type: event.type,
            data: event.data || {},
            timestamp: event.timestamp || Date.now()
        }
        await this.redis.xadd(
            'event_stream',
            '*',
            'payload',
            JSON.stringify(payload)
        );

        return { status: 'queued' };
    }
}
