import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class FeatureFlag {
    @Prop({ required: true })
    name: string;

    @Prop({ default: false })
    active: boolean;

    @Prop({ type: Object, default: {} })
    conditions: any;

    @Prop({ type: Object, default: {} })
    variants?: Record<string, number>
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag)
