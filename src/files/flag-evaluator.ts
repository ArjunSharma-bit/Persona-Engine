// src/engine/flag-evaluator.ts
import { FeatureFlag } from "../schema/featureflag.schema";
import { Profile } from "../types/profile";

export class FlagEvaluator {

    evaluate(profile: Profile, flags: FeatureFlag[]) {
        const result: Record<string, any> = {};

        for (const flag of flags) {
            if (!flag.active) {
                result[flag.name] = false;
                continue;
            }

            if (!this.matchesConditions(profile, flag.conditions || {})) {
                result[flag.name] = false;
                continue;
            }

            if (flag.variants && Object.keys(flag.variants).length > 0) {
                result[flag.name] = this.assignVariant(flag.variants, profile.userId);
            } else {
                result[flag.name] = true;
            }
        }

        return result;
    }

    private matchesConditions(profile: Profile, conditions: any) {
        for (const key in conditions) {
            const rule = conditions[key];
            const val = (profile as any)[key];

            if (typeof rule === "object" && "$gt" in rule) {
                if (!(val > rule["$gt"])) return false;
            } else if (typeof rule === "object" && "$lt" in rule) {
                if (!(val < rule["$lt"])) return false;
            } else if (Array.isArray(rule)) {
                if (!rule.includes(val)) return false;
            } else {
                if (val !== rule) return false;
            }
        }
        return true;
    }

    private assignVariant(variants: Record<string, number>, userId: string) {
        const hash = [...userId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const bucket = hash % 100;

        let cumulative = 0;
        for (const [variant, pct] of Object.entries(variants)) {
            cumulative += pct;
            if (bucket < cumulative) return variant;
        }

        return Object.keys(variants)[0];
    }
}
