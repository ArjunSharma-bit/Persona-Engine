import { Module } from '@nestjs/common';
import { EventModule } from './modules/event.module'
import { MongoModule } from './database/mongo.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ProfileModule } from './modules/profile.module';
import { AnalyticsModule } from './modules/analytics.module';
import { MlModule } from './ml/ml.module';
import { ReplayModule } from './modules/replay.module';
import { FeatureFlagModule } from './modules/featureflag.module';

@Module({
    imports: [
        RedisModule.forRoot({
            type: 'single',
            options: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT)
            }
        }),
        EventModule, MongoModule, ProfileModule, AnalyticsModule, MlModule, ReplayModule, FeatureFlagModule,],
})
export class AppModule { }
