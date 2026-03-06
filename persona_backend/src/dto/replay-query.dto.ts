import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsIn, IsNumberString } from "class-validator";

export class ReplayQueryDto {
    @ApiProperty({ example: "1600000000000" })
    @IsNumberString()
    from: string;

    @ApiProperty({ example: "1800000000000" })
    @IsNumberString()
    to: string;

    @ApiPropertyOptional({
        example: "full",
        enum: ["full", "recompute", "patch", "dry-run", "triggers-only"]
    })
    @IsOptional()
    @IsIn(["full", "recompute", "patch", "dry-run", "triggers-only"])
    mode?: string = "full";

    @ApiPropertyOptional({ example: "300" })
    @IsOptional()
    @IsNumberString()
    eps?: string = "300";
}
