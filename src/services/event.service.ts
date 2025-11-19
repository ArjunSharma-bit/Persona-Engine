import { Injectable } from '@nestjs/common'

@Injectable()
export class EventService {
    async ingestEvent(event: any) {
        if (!event?.userId || !event.type) {
            return { error: "Missing Req fields :: userId, type" };
        }
        console.log('Event Received', event);
        return { status: 'accepted' };
    }
}