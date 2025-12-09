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
        @InjectModel(UserProfile.name) private readonly profileModel: Model<UserProfile>,
        @InjectRedis() private readonly redis: Redis,
        private readonly mlService: MlService,
    ) { }

    static createForWorker(model: Model<UserProfile>, redis: Redis, ml: MlService) {
        return new ProfileService(model, redis, ml);
    }

    async upsertProfileFromEvent(event: { userId: string; type: string; data: any; timestamp: number; },
        mode: "full" | "recompute" | "profile-only" = "full"
    ) {
        const { userId, type, data, timestamp = Date.now() } = event;

        let profile = await this.profileModel.findOne({ userId });

        if (!profile) {
            profile = new this.profileModel({
                userId,
                totalEvents: 0,
                sessionCount: 0,
                totalPurchaseAmount: 0,
                categoriesViewed: [],
                lastSeenProduct: null,
                lastActiveAt: timestamp,
                segments: [],
                churnScore: 0,
                affinityScores: {},
            } as Partial<UserProfile>);
        }

        profile.totalEvents = (profile.totalEvents || 0) + 1;
        profile.lastActive = timestamp;

        switch (type) {
            case 'product_view':
                if (data?.category) {
                    if (!profile.categoriesViewed.includes(data.category)) {
                        profile.categoriesViewed.push(data.category);
                    }
                }
                if (data?.productId) profile.lastSeenProduct = data.productId;
                break;

            case 'purchase':
                profile.totalPurchaseAmount = (profile.totalPurchaseAmount || 0) + (Number(data?.amount) || 0);
                break;

            case 'session_start':
                profile.sessionCount = (profile.sessionCount || 0) + 1;
                break;

            case 'add_to_cart':
            case 'search':
            default:
                break;
        }
        if (mode === "full" || mode === "recompute") {
            this.applyMl(profile)
            this.applyAffinity(profile)
            this.applySegment(profile)
        }
        await profile.save();
        await this.redis.set(`profile:${userId}`, JSON.stringify(profile), 'EX', 3600);

        return profile;
    }

    //ml scoring
    private applyMl(profile: UserProfile) {
        const inactivityDays = Math.max(0, (Date.now() - (profile.lastActive || Date.now())) / (1000 * 60 * 60 * 24));
        const churnFeatures = [
            profile.totalEvents || 0,
            inactivityDays,
            profile.sessionCount || 0,
        ];
        profile.churnScore = this.mlService.predictChurn(churnFeatures);
    }

    //affinity scoring
    private applyAffinity(profile: UserProfile) {
        const categoryCounts = profile.categoriesViewed.reduce((acc, cat) => {
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});
        profile.affinityScore = categoryCounts;
    }
    //segment scoring
    private applySegment(profile: UserProfile) {
        const segments: string[] = [];

        if ((profile.totalEvents || 0) > 50 || (profile.sessionCount || 0) > 10) {
            segments.push('high_activity');
        }

        if (profile.affinityScore && Object.keys(profile.affinityScore).length > 0) {
            const sorted = Object.entries(profile.affinityScore).sort((a, b) => (b[1]) - (a[1]));
            const [topCategory, topCount] = sorted[0];
            const total = Object.values(profile.affinityScore).reduce((a, b) => (a) + (b), 0) || 1;
            if ((topCount) / (total) > 0.5) {
                segments.push(`${topCategory}_lover`);
            }
        }

        // Big spender
        if ((profile.totalPurchaseAmount || 0) > 10000) {
            segments.push('big_spender');
        }

        // At risk
        if ((profile.churnScore || 0) > 0.6) {
            segments.push('at_risk');
        }

        // New user
        if ((profile.totalEvents || 0) < 5) {
            segments.push('new_user');
        }

        profile.segments = Array.from(new Set(segments));
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