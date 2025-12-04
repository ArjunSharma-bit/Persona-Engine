import { ApiProperty } from "@nestjs/swagger";

export class EventResponseDto {
    @ApiProperty({ example: "queued" })
    status: string;
}
