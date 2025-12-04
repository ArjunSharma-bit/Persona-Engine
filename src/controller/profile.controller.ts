import { Controller, Get, Param } from "@nestjs/common";
import { ProfileService } from "../services/profile.service";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { SegmentResponseDto } from "../dto/segment.response.dto";

@ApiTags("Segments")
@Controller("segments")
export class ProfileSegmentsController {
    constructor(private readonly profileService: ProfileService) { }

    @Get(":userId")
    @ApiOperation({ summary: "Get segmentation labels for a user" })
    @ApiParam({ name: "userId", type: String })
    @ApiResponse({
        status: 200,
        schema: { example: { segments: ["big_spender", "electronics_lover"] } }
    })
    async getSegments(@Param("userId") userId: string): Promise<SegmentResponseDto> {
        const profile = await this.profileService.getProfile(userId);
        return { segments: profile?.segments || [] };
    }
}
