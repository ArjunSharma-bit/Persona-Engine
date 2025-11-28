import Redis from 'ioredis';
import mongoose from 'mongoose';
import { normalizeEvent } from '../src/norma-lizers';
import { EventSchema } from '../src/schema/event.schema';
import { UserProfileSchema } from '../src/schema/profile.schema';
import { ProfileService } from "../src/services/profile.service";
import { MlService } from '../src/ml/ml.service';
import { TriggerSchema } from '../src/schema/trigger.schema';
import { TriggerService } from '../src/services/trigger.service';
import { TriggerEvaluator } from './trigger-eval';
import { mapMongoTrigger } from '../src/mapper/trigger.mapper'
import { mapMongoProfile } from '../src/mapper/profile.mapper'

async function bootstrap() {
  const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");

  await mongoose.connect(process.env.MONGO_URL || "mongodb://mongo1:27017,mongo2:27018,mongo3:27019/personalization?replicaSet=rs0");

  const EventModel = mongoose.model('Event', EventSchema);
  const UserProfileModel = mongoose.model('UserProfile', UserProfileSchema);
  const TriggerModel = mongoose.model('Trigger', TriggerSchema)

  const mlService = new MlService();
  const profileService = ProfileService.createForWorker(UserProfileModel, redis, mlService)
  const triggerService = new TriggerService(TriggerModel)

  const triggerEval = new TriggerEvaluator();

  console.log('Worker started, listening for events...');

  while (true) {
    const response = await redis.xread(
      'BLOCK',
      5000,
      'STREAMS',
      'event_stream',
      '$'
    );

    if (!response) continue;

    const [stream, entries] = response[0];
    for (const [id, fields] of entries) {
      try {
        const payload = JSON.parse(fields[1]);

        const { userId, type, data, timestamp } = payload;
        const normalizedData = normalizeEvent(type, data);

        await EventModel.create({
          userId, type, data: normalizedData, timestamp,
        });

        const profile = await profileService.upsertProfileFromEvent({
          userId, type, data: normalizedData, timestamp,
        })

        const triggerDocs = await triggerService.getActiveTrigger();
        const triggers = mapMongoTrigger(triggerDocs)
        const plainPro = mapMongoProfile(profile)
        const fired = await triggerEval.evaluateTriggers(plainPro, triggers)

        if (fired.length > 0) {
          console.log(" Triggers Firrrrred", fired);
        }

        console.log('processed event:', id, 'for user:', userId)


      } catch (err) {
        console.error("worker Error", err)

        await redis.xadd("event_stream_dlq", "*", "payload", fields[1]);
      }
    }
  }
}


bootstrap();
