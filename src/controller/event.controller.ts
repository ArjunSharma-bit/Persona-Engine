import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common'
import { EventService } from '../services/event.service'
import { EventDto } from '../dto/event.dto'

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async ingest(@Body() body: EventDto) {
        return this.eventService.ingestEvent(body)
    }
}