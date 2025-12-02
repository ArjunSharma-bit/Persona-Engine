import { MongooseModule } from "@nestjs/mongoose";
import { ReplayController } from "./controller/replay.controller";
import { ReplayService } from "./services/replay.service";
import { Module } from "@nestjs/common";
import { EventSchema } from "./schema/event.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])
    ],
    controllers: [ReplayController],
    providers: [ReplayService],
})
export class ReplayModule { }
