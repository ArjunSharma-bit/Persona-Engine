import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Event extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    type: string;

    @Prop({ type: Object })
    data: Record<string, any>;

    @Prop({ required: true })
    timestamp: number;

}

export const EventSchema = SchemaFactory.createForClass(Event)