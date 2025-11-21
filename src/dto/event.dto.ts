import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { EventType } from '../types/event-types';

export class EventDto {
    @IsString()
    userId: string;

    @IsString()
    type: EventType;

    @IsOptional()
    @IsObject()
    data?: Record<string, any>;

    @IsOptional()
    @IsNumber()
    timestamp?: number;
}
