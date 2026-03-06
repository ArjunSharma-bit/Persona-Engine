import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Trigger } from "../schema/trigger.schema";
import { Model } from "mongoose";

@Injectable()
export class TriggerService {
    constructor(
        @InjectModel(Trigger.name) private triggerModel: Model<Trigger>
    ) { }

    async getActiveTrigger() {
        return this.triggerModel.find({ active: true })
    }
}