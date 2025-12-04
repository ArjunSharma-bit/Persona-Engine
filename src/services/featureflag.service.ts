import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FeatureFlag } from "../schema/featureflag.schema";
import { Model } from "mongoose";

@Injectable()
export class FeatureFlagService {
    constructor(@InjectModel(FeatureFlag.name) private readonly flagModel: Model<FeatureFlag>) { }

    getAll() {
        return this.flagModel.find({ enabled: true });
    }

    create(data: any) {
        return this.flagModel.create(data);
    }

    update(name: string, update: any) {
        return this.flagModel.findOneAndUpdate({ name }, update, { new: true });
    }
}
