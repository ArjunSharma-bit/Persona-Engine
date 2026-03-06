import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { getContext } from "../co-id/current-context";
import { EventDto } from "../dto/event-request.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Event } from "../schema/event.schema";
import { timestamp } from "rxjs";
@Injectable()
export class EventService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
        @InjectModel(Event.name) private eventModel: Model<Event>
    ) { }


    async ingestEvent(event: EventDto) {
        const payload = {
            userId: event.userId,
            type: event.type,
            data: event.data || {},
            timestamp: event.timestamp || Date.now()
        }
        const context = getContext()
        const reqId = context.reqId

        await this.redis.xadd(
            'event_stream',
            '*',
            'payload',
            JSON.stringify({ ...payload, reqId: reqId || null })
        );

        return { status: 'queued' };
    }

    async findAll() {
        return this.eventModel.find().sort({ timestamp: -1 }).limit(20).exec()
    }
}
