import { Module } from '@nestjs/common';
import { EventModule } from './event.module'
import { MongoModule } from './database/mongo.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ProfileModule } from './profile.module';
import { AnalyticsModule } from './analytics.module';
import { MlModule } from './ml/ml.module';
import { ReplayModule } from './replay.module';

@Module({
    imports: [
        RedisModule.forRoot({
            type: 'single',
            options: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT)
            }
        }),
        EventModule, MongoModule, ProfileModule, AnalyticsModule, MlModule, ReplayModule,],
})
export class AppModule { }
