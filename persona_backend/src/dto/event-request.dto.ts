import { IsString, IsNumber, IsOptional, IsObject, IsNotEmpty, IsIn, } from 'class-validator';
import { EventType } from '../types/event-types';
import { ApiProperty } from '@nestjs/swagger';

const VALID_EVENT_TYPES: EventType[] = [
    'product_view', 'search', 'add_to_cart', 'purchase',
    'session_start', 'session_end', 'app_open', 'click', 'custom'
];
export class EventDto {
    @ApiProperty({ example: "u123" })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({ example: "product_view", enum: VALID_EVENT_TYPES })
    @IsNotEmpty()
    @IsIn(VALID_EVENT_TYPES, { message: "Invalid event type" })
    type: EventType;

    @ApiProperty({ example: { productId: "Ca3", category: "electronics" } })
    @IsOptional()
    @IsObject()
    data?: Record<string, any>;

    @ApiProperty({ example: "product_view" })
    @IsOptional()
    @IsNumber()
    timestamp?: number;
}
