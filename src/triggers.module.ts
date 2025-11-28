import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Trigger, TriggerSchema } from "./schema/trigger.schema";
import { TriggerService } from "./services/trigger.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Trigger.name, schema: TriggerSchema }]),
    ],
    providers: [TriggerService],
    exports: [TriggerService],
})
export class TriggerModule { }