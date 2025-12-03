import { Controller, Get, Param } from "@nestjs/common";
import { ProfileService } from "../services/profile.service";
import { FeatureFlagService } from "../services/featureflag.service";
import { FlagEvaluator } from "../files/flag-evaluator";

@Controller("flags")
export class FlagUserController {
    private readonly evaluator = new FlagEvaluator();

    constructor(
        private readonly profileService: ProfileService,
        private readonly flagService: FeatureFlagService
    ) { }

    @Get("user/:userId")
    async getUserFlags(@Param("userId") userId: string) {
        const profile = await this.profileService.getProfile(userId);
        const flags = await this.flagService.getAll();
        return this.evaluator.evaluate(profile, flags);
    }
}
