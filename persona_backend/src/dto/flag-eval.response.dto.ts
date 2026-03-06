import { ApiProperty } from "@nestjs/swagger";

export class ReplayResponseDto {
    @ApiProperty({ example: 120 })
    replayed: number;

    @ApiProperty({
        example: { from: 1600000000000, to: 1800000000000 }
    })
    range: { from: number; to: number };

    @ApiProperty({ example: "full" })
    mode: string;

    @ApiProperty({ example: 300 })
    eps: number;
}
