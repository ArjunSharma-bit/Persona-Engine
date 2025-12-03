import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FeatureFlag, FeatureFlagSchema } from "../schema/featureflag.schema";
import { FeatureFlagController } from "../controller/featureflag.controller";
import { FlagUserController } from "../controller/flag-user.controller";
import { FeatureFlagService } from "../services/featureflag.service";
import { ProfileModule } from "./profile.module";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FeatureFlag.name, schema: FeatureFlagSchema }
        ]), ProfileModule,
    ],
    controllers: [FeatureFlagController, FlagUserController],
    providers: [FeatureFlagService],
    exports: [FeatureFlagService],

})
export class FeatureFlagModule { }