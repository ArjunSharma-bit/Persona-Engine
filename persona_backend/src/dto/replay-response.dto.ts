import { ApiProperty } from "@nestjs/swagger";

export class ReplayResponseDto {
    @ApiProperty({ example: "full" })
    mode: string;

    @ApiProperty({ example: 300 })
    total: number;

    @ApiProperty({ example: 120 })
    processed: number;

    @ApiProperty({ example: 0.324 })
    durationSec: number;
}
