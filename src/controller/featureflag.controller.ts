import { BadRequestException, Body, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe } from "@nestjs/common";
import { FeatureFlagService } from "../services/featureflag.service";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiOkResponse } from "@nestjs/swagger";
import { CreateFeatureFlagDto, UpdateFeatureFlagDto } from "../dto/feature-flag.dto";
import { FeatureFlagResponseDto } from "../dto/feature-flag-response.dto";

@ApiTags("Feature Flags")
@Controller("flags")
export class FeatureFlagController {
    constructor(private readonly flagService: FeatureFlagService) { }

    @Get()
    @ApiOperation({ summary: "Get all enabled feature flags" })
    @ApiResponse({ status: 200 })
    @ApiOkResponse({ type: FeatureFlagResponseDto, isArray: true })
    get() {
        return this.flagService.getAll();
    }

    @Post()
    @ApiOperation({ summary: "Create a new feature flag" })
    @ApiOkResponse({ type: FeatureFlagResponseDto, isArray: true })
    @ApiBody({
        schema: {
            example: {
                name: "new-ui",
                active: true,
                conditions: { segments: ["big_spender"] },
                variants: { A: 50, B: 50 }
            }
        }
    })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @ApiResponse({ status: 201, description: "Feature flag created" })
    async create(@Body() dto: CreateFeatureFlagDto) {
        if (!dto?.name) throw new BadRequestException("Feature flag 'name' is required")
        return this.flagService.create(dto);
    }

    @Put(":name")
    @ApiOperation({ summary: "Update a feature flag" })
    @ApiParam({ name: "name", type: String })
    @ApiOkResponse({ type: FeatureFlagResponseDto, isArray: true })
    @ApiBody({
        schema: {
            example: {
                active: false,
                variants: { A: 100, B: 0 }
            }
        }
    })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @ApiResponse({ status: 200, description: "Flag updated" })
    async update(@Param("name") name: string, @Body() dto: UpdateFeatureFlagDto) {
        const flag = await this.flagService.update(name, dto);
        if (!flag) throw new BadRequestException(`Flag '${name}'not found`);
        return flag;
    }
}
