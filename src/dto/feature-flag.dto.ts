import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsObject, IsOptional, IsString, IsNotEmpty } from "class-validator";

export class CreateFeatureFlagDto {
    @ApiProperty({ example: "discount-banner" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    enabled: boolean;

    @ApiPropertyOptional({
        example: { segments: ["big_spender"], churnScore: { $lt: 0.5 } }
    })
    @IsOptional()
    @IsObject()
    conditions?: Record<string, any>;

    @ApiPropertyOptional({
        example: { A: 50, B: 50 },
        description: "Variant distribution percentages (must total 100)"
    })
    @IsOptional()
    @IsObject()
    variants?: Record<string, number>;
}

export class UpdateFeatureFlagDto {
    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    conditions?: Record<string, any>;

    @ApiPropertyOptional({ example: { A: 60, B: 40 } })
    @IsOptional()
    @IsObject()
    variants?: Record<string, number>;
}
