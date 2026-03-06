import { ApiProperty } from "@nestjs/swagger";

export class FeatureFlagResponseDto {
    @ApiProperty({ example: "new-ui" })
    name: string;

    @ApiProperty({ example: true })
    enabled: boolean;

    @ApiProperty({ example: { segments: ["big_spender"] } })
    conditions: Record<string, any>;

    @ApiProperty({ example: { A: 50, B: 50 } })
    variants?: Record<string, number>;

    @ApiProperty({ example: "2025-12-03T12:00:00.000Z" })
    createdAt: string;

    @ApiProperty({ example: "2025-12-03T12:00:00.000Z" })
    updatedAt: string;
}
