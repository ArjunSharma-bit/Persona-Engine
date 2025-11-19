import { Controller, Post, Body } from '@nestjs/common'
import { EventService } from '../services/event.service'

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post()
    async ingest(@Body() event: any) {
        return this.eventService.ingestEvent(event)
    }
}