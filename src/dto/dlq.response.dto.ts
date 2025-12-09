import { ApiProperty } from "@nestjs/swagger";

export class DlqEventDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ example: { userId: "u1", type: "purchase", data: { amount: 100 } } })
    payload: any;
}
