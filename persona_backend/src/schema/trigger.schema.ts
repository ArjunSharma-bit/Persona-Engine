import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Trigger extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, type: Object, default: {} })
    condition: Record<string, any>;

    @Prop({ type: { type: String, enum: ["log", "webhook"], required: true }, message: { type: String, required: true }, url: { type: String } })
    action: {
        type: "log" | "webhook";
        url?: string;
        message: string;
    }

    @Prop({ default: true })
    active: boolean;
}

export const TriggerSchema = SchemaFactory.createForClass(Trigger)
