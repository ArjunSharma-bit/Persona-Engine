import Redis from 'ioredis';
import mongoose from 'mongoose';
import { normalizeEvent } from '../files/norma-lizers';
import { EventSchema } from '../schema/event.schema';
import { UserProfileSchema } from '../schema/profile.schema';
import { ProfileService } from "../services/profile.service";
import { MlService } from '../ml/ml.service';
import { TriggerSchema } from '../schema/trigger.schema';
import { TriggerService } from '../services/trigger.service';
import { TriggerEvaluator } from './trigger-eval';
import { mapMongoTrigger } from '../mapper/trigger.mapper'
import { mapMongoProfile } from '../mapper/profile.mapper'
import { appLogger } from '../logger/logger.service';
import { runWithContext } from '../co-id/current-context';

async function bootstrap() {
  const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");

  await mongoose.connect(
    process.env.MONGO_URL || "mongodb://mongo1:27017,mongo2:27018,mongo3:27019/personalization?replicaSet=rs0"
  );

  const EventModel = mongoose.model('Event', EventSchema);
  const UserProfileModel = mongoose.model('UserProfile', UserProfileSchema);
  const TriggerModel = mongoose.model('Trigger', TriggerSchema);

  const mlService = new MlService();
  const profileService = ProfileService.createForWorker(UserProfileModel, redis, mlService);
  const triggerService = new TriggerService(TriggerModel);
  const triggerEval = new TriggerEvaluator();

  appLogger.info("Worker started, listening for events...");

  while (true) {
    const response = await redis.xread("BLOCK", 5000, "STREAMS", "event_stream", "$");
    if (!response) continue;

    const [stream, entries] = response[0];

    for (const [id, fields] of entries) {
      try {
        const payload = JSON.parse(fields[1]);

        const requestId = payload.requestId || null;

        runWithContext({ requestId }, async () => {
          const { userId, type, data, timestamp, replayMode } = payload;

          appLogger.info(`Worker: received event ${id} for user=${userId}`);

          const normalizedData = normalizeEvent(type, data);

          switch (replayMode) {
            case "dry-run":
              appLogger.info("Replay[dry-run]: Skipping event");
              return;

            case "recompute":
              await profileService.upsertProfileFromEvent({
                userId, type, data: normalizedData, timestamp
              });
              appLogger.info("Replay[recompute]: Profile recomputed");
              return;

            case "profile-only":
              await profileService.upsertProfileFromEvent({
                userId, type, data: normalizedData, timestamp
              });
              appLogger.info("Replay[profile-only]: Profile updated only");
              return;

            case "triggers-only":
              {
                const existing = await UserProfileModel.findOne({ userId });
                if (existing) {
                  const domainProfile = mapMongoProfile(existing);
                  const triggerDocs = await triggerService.getActiveTrigger();
                  const triggers = mapMongoTrigger(triggerDocs);
                  const fired = await triggerEval.evaluateTriggers(domainProfile, triggers);
                  appLogger.info(`Replay[triggers-only]: Fired ${fired}`);
                }
                return;
              }

            default:
              break;
          }

          await EventModel.create({ userId, type, data: normalizedData, timestamp });

          const profile = await profileService.upsertProfileFromEvent({
            userId, type, data: normalizedData, timestamp
          });

          const triggerDocs = await triggerService.getActiveTrigger();
          const triggers = mapMongoTrigger(triggerDocs);
          const domainProfile = mapMongoProfile(profile);

          const fired = await triggerEval.evaluateTriggers(domainProfile, triggers);
          if (fired.length > 0) {
            appLogger.info(`Worker: triggers fired ${JSON.stringify(fired)}`);
          }

          appLogger.info(`Worker: processed event ${id} for user=${userId}`);
        });

      } catch (err: any) {
        const failedPayload = JSON.parse(fields[1]);
        const reqId = failedPayload.reqId || null;
        appLogger.error(`Worker Error: ${err.message}`);

        await redis.xadd("event_stream_dlq", "*", "payload", JSON.stringify({
          original: failedPayload,
          error: err.message,
          reqId,
        }));
      }
    }
  }
}

bootstrap();
