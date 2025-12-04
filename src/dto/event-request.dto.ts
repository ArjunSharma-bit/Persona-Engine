import { IsString, IsNumber, IsOptional, IsObject, IsNotEmpty, } from 'class-validator';
import { EventType } from '../types/event-types';
import { ApiProperty } from '@nestjs/swagger';

export class EventDto {
    @ApiProperty({ example: "u123" })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({ example: "product_view" })
    @IsNotEmpty()
    @IsString()
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
