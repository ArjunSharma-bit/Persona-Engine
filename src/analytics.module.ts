import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventSchema, Event } from "./schema/event.schema";
import { AnalyticsService } from "./services/analytics.service";
import { AnalyticsController } from "./controller/analytics.controller";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule { }