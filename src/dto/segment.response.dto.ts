import { ApiProperty } from "@nestjs/swagger";

export class SegmentResponseDto {
    @ApiProperty({ example: ["big_spender", "electronics_lover"] })
    segments: string[];
}
