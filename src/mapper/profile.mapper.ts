import { Profile } from "../types/profile";

export function mapMongoProfile(doc: any): Profile {
    const obj = doc.toObject();

    return {
        userId: obj.userId,
        totalEvents: obj.totalEvents ?? 0,
        sessionCount: obj.sessionCount ?? 0,
        totalPurchaseAmount: obj.totalPurchaseAmount ?? 0,
        categoriesViewed: obj.categoriesViewed ?? [],
        lastSeenProduct: obj.lastSeenProduct,
        segments: obj.segments ?? [],
        churnScore: obj.churnScore ?? 0,
        affinityScores: obj.affinityScores ?? {},
        lastActiveAt: obj.lastActiveAt ?? obj.lastActive ?? Date.now()

    }
}