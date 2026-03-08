import { Module } from '@nestjs/common';
import { EventController } from '../controller/event.controller';
import { EventService } from '../services/event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema, Event } from '../schema/event.schema';
import { ProfileModule } from './profile.module';
import { EventsGateway } from '../controller/events.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    ProfileModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventsGateway],
})
export class EventModule { }
