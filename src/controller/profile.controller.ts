import { Controller, Get, Param } from "@nestjs/common";
import { ProfileService } from "../services/profile.service";

@Controller("segments")
export class ProfileSegmentsController {
    constructor(private readonly profileService: ProfileService) { }

    @Get(":userId")
    async getSegments(@Param("userId") userId: string) {
        const profile = await this.profileService.getProfile(userId);
        return { segments: profile?.segments || [] }
    }
}