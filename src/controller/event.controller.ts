import { Controller, Post, Body, UsePipes, ValidationPipe } from "@nestjs/common";
import { EventService } from "../services/event.service";
import { EventDto } from "../dto/event-request.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBadRequestResponse } from "@nestjs/swagger";
import { EventResponseDto } from "../dto/event-response.dto";

@ApiTags("Events")
@Controller("events")
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post()
    @ApiOperation({ summary: "Ingest a new user event" })
    @ApiBody({
        schema: {
            example: {
                userId: "uTest1",
                type: "product_view",
                data: { productId: "p1", category: "electronics" },
                timestamp: 1764312000000
            }
        }
    })
    @ApiResponse({ status: 201, description: "Event ingested" })
    @ApiBadRequestResponse({ description: "Invalid event payload" })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async ingest(@Body() body: EventDto): Promise<EventResponseDto> {
        const result = await this.eventService.ingestEvent(body);
        return result;
    }
}
