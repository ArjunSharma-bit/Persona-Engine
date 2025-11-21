import Redis from 'ioredis';
import mongoose from 'mongoose';
import { normalizeEvent } from '../src/norma-lizers';
import { EventSchema } from '../src/schema/event.schema';
import { UserProfileSchema } from '../src/schema/profile.schema';

async function bootstrap() {
  const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");

  await mongoose.connect(process.env.MONGO_URL || "mongodb://mongo1:27017,mongo2:27018,mongo3:27019/personalization?replicaSet=rs0");

  const EventModel = mongoose.model('Event', EventSchema);
  const UserProfileModel = mongoose.model('UserProfile', UserProfileSchema);

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
      const payload = JSON.parse(fields[1]);

      const { userId, type, data, timestamp } = payload;

      // Normalize
      const normalizedData = normalizeEvent(type, data);

      // Save Event
      await EventModel.create({
        userId,
        type,
        data: normalizedData,
        timestamp,
      });

      // Update Profile
      const profile = await UserProfileModel.findOne({ userId }) ||
        new UserProfileModel({ userId, totalEvents: 0, sessionCount: 0 });

      profile.totalEvents += 1;
      profile.lastActive = timestamp;

      if (type === 'product_view') {
        if (normalizedData.category) {
          if (!profile.categoriesViewed.includes(normalizedData.category)) {
            profile.categoriesViewed.push(normalizedData.category);
          }
        }
        profile.lastSeenProduct = normalizedData.productId;
      }

      if (type === 'purchase') {
        profile.totalPurchaseAmount += normalizedData.amount;
      }

      if (type === 'session_start') {
        profile.sessionCount += 1;
      }

      await profile.save();

      console.log('Processed event:', id, 'for user:', userId);
    }
  }
}

bootstrap();
