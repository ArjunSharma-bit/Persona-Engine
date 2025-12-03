import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { FeatureFlagService } from "../services/featureflag.service";

@Controller("flags")
export class FeatureFlagController {
    constructor(private readonly flagService: FeatureFlagService) { }

    @Get()
    get() {
        return this.flagService.getAll()
    }

    @Post()
    create(@Body() body) {
        return this.flagService.create(body)
    }

    @Put(":name")
    update(@Param("name") name: string, @Body() body) {
        return this.flagService.update(name, body)
    }

}