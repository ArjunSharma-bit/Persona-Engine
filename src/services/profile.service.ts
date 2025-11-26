import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserProfile } from "../schema/profile.schema";
import { Model } from "mongoose";
import { Redis } from 'ioredis'
import { InjectRedis } from "@nestjs-modules/ioredis";
import { MlService } from "../ml/ml.service";

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel(UserProfile.name) private profileModel: Model<UserProfile>,
        @InjectRedis() private readonly redis: Redis,
        private readonly mlService: MlService,
    ) { }


    async updateProfile(event: any) {
        const { userId, type, timestamp, data } = event;

        let profile = await this.profileModel.findOne({ userId })

        if (!profile) {
            profile = new this.profileModel({ userId, lastActive: timestamp })
        }

        profile.totalEvents += 1;
        profile.lastActive = timestamp;


        switch (type) {
            case 'product_view':
                if (data.category && !profile.categoriesViewed.includes(data.category)) {
                    profile.categoriesViewed.push(data.category);
                }
                if (data.productId) {
                    profile.lastSeenProduct = data.productId;
                }
                break;


            case 'purchase':
                profile.totalPurchaseAmount += data.amount || 0;
                break;

            case 'session_start':
                profile.sessionCount += 1;
                break;
        }

        const inactivityDays = Math.max(0, (Date.now() - profile.lastActive) / (1000 * 60 * 60 * 24))

        const churnFeatures = [
            profile.totalEvents,
            inactivityDays,
            profile.sessionCount,
        ]

        profile.churnScore = this.mlService.predictChurn(churnFeatures);

        const categoryCounts = profile.categoriesViewed.reduce((acc, cat) => {
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {})

        profile.affinityScore = categoryCounts;

        await profile.save()

        await this.redis.set(`profile:${userId}`, JSON.stringify(profile), 'EX', 3600)
        return profile
    }

    async getProfile(userId: string) {
        const cached = await this.redis.get(`profile:${userId}`);
        if (cached) return JSON.parse(cached);

        const profile = await this.profileModel.findOne({ userId });
        if (profile) {
            await this.redis.set(`profile:${userId}`, JSON.stringify(profile), 'EX', 3600)
        }
        return profile;
    }
}