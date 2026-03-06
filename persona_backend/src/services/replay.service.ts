import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { Model } from "mongoose";
import { Event } from "../schema/event.schema";
import { InjectModel } from "@nestjs/mongoose";
import { replayStatus } from "../mapper/replay.status";
import { randomUUID } from "crypto";


@Injectable()
export class ReplayService {
    @InjectRedis() private readonly redis: Redis;
    @InjectModel(Event.name) private readonly EventModel: Model<Event>

    async replayEvents(from: number, to: number, mode: string, eps: number) {
        const events = await this.EventModel.find({
            timestamp: { $gte: from, $lte: to }
        }).sort({ timestamp: 1 })

        const total = events.length;
        let processed = 0;
        const replayReqId = randomUUID();

        replayStatus.active = true;
        replayStatus.mode = mode;
        replayStatus.total = total;
        replayStatus.processed = 0;
        replayStatus.startedAt = Date.now();

        if (Number.isNaN(from) || Number.isNaN(to)) throw new Error("Replay range must be numeric timestamps")

        for (const e of events) {
            await this.redis.xadd(
                "event_stream",
                "*",
                "payload",
                JSON.stringify({
                    userId: e.userId,
                    type: e.type,
                    data: e.data,
                    timestamp: e.timestamp,
                    replayMode: mode,
                    reqId: replayReqId,
                })
            )
            processed++;
            replayStatus.processed = processed;
            await new Promise(r => setTimeout(r, 2));
        }
        replayStatus.active = false;
        replayStatus.completedAt = Date.now()

        return {
            mode, total, processed, durationSec: (replayStatus.completedAt - replayStatus.startedAt) / 1000
        }
    }
}