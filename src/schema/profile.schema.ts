import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
@Schema({ timestamps: true })
export class UserProfile extends Document {

    @Prop({ required: true, unique: true })
    userId: string;

    @Prop({ default: 0 })
    totalEvents: number;

    @Prop({ default: 0 })
    sessionCount: number;

    @Prop({ default: 0 })
    totalPurchaseAmount: number;

    @Prop({ type: [String], default: [] })
    categoriesViewed: string[];

    @Prop()
    lastSeenProduct?: string;

    @Prop()
    lastActive: number;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile)