import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ProfileService } from "../services/profile.service";
import { FeatureFlagService } from "../services/featureflag.service";
import { FlagEvaluator } from "../files/flag-evaluator";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";

@ApiTags("Feature Flags")
@Controller("flags")
export class FlagUserController {
    private readonly evaluator = new FlagEvaluator();

    constructor(
        private readonly profileService: ProfileService,
        private readonly flagService: FeatureFlagService
    ) { }

    @Get("user/:userId")
    @ApiOperation({ summary: "Evaluate flags for a specific user" })
    @ApiParam({ name: "userId", type: String })
    @ApiResponse({
        status: 200,
        description: "Feature flags evaluated",
        schema: {
            example: {
                "new-ui": true,
                "discount-banner": false,
                "recommendation-v2": "B"
            }
        }
    })

    async getUserFlags(@Param("userId") userId: string) {
        const profile = await this.profileService.getProfile(userId);
        if(!profile) throw new NotFoundException(`Profile for user '${userId}' not found`);
        
        const flags = await this.flagService.getAll();
        return this.evaluator.evaluate(profile, flags);
    }
}
