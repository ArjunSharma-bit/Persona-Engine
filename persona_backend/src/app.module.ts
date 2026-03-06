import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventModule } from './modules/event.module'
import { MongoModule } from './database/mongo.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ProfileModule } from './modules/profile.module';
import { AnalyticsModule } from './modules/analytics.module';
import { MlModule } from './ml/ml.module';
import { ReplayModule } from './modules/replay.module';
import { FeatureFlagModule } from './modules/featureflag.module';
import { RequestLoggerMiddleware } from './logger/req-log.middleware';
import { DlqController } from './controller/dlq.controller';
import { ReqIdMiddleware } from './co-id/middleware/req-id.middleware';

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
    providers: [

    ],
    controllers: [DlqController],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ReqIdMiddleware, RequestLoggerMiddleware).forRoutes("*")
    }
}
