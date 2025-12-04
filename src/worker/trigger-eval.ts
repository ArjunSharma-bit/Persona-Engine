import axios from 'axios'
import { Profile, TriggerDefinition, TriggerCondition, TriggerAction } from "../types/profile";
import { appLogger } from '../logger/logger.service';
export class TriggerEvaluator {
    async evaluateTriggers(profile: Profile, triggers: TriggerDefinition[]): Promise<string[]> {
        const fired: string[] = [];

        for (const t of triggers) {
            if (this.matchesCondition(profile, t.condition)) {
                await this.executeAction(t.action, profile);
                fired.push(t.name);
            }
        }

        return fired;
    }

    matchesCondition(profile: Profile, condition: TriggerCondition): boolean {
        for (const key in condition) {
            const rule = condition[key];

            const p = profile as Record<string, any>

            if (typeof rule === "object" && "$gt" in rule) {
                if (!(p[key] > rule["$gt"])) return false;
            }
            else if (typeof rule === "object" && "$lt" in rule) {
                if (!(p[key] < rule["$lt"])) return false;
            }
            else if (typeof rule === "object" && "$eq" in rule) {
                if (!(p[key] === rule["$eq"])) return false;
            }
            else if (typeof rule === "object" && "$neq" in rule) {
                if (!(p[key] !== rule["$neq"])) return false;
            }
            else if (Array.isArray(p[key])) {
                if (!p[key].includes(rule)) return false;
            }
            else if (p[key] !== rule) {
                return false;
            }
        }

        return true;
    }

    async executeAction(action: TriggerAction, profile: Profile): Promise<void> {
        switch (action.type) {
            case "log":
                appLogger.info(`TRIGGER ACTION LOG: ${action.message} (user=${profile.userId})`);
                break;

            case "webhook":
                try {
                    await axios.post(action.url, {
                        userId: profile.userId,
                        message: action.message,
                        profile,
                    });
                } catch (err) {
                    if (err instanceof Error) {
                        appLogger.error(`Trigger webhook failed: ${err.message}`);
                    } else {
                        appLogger.debug(`Unknown Error: ${err}`)
                    }
                }
                break;
        }
    }
}

