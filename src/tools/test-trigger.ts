import { Trigger } from "../schema/trigger.schema";
import { Profile, TriggerDefinition } from "../types/profile";
import { TriggerEvaluator } from "../worker/trigger-eval";

// fake profile to test
const profile: Profile = {
    userId: "testUser",
    totalEvents: 0,
    sessionCount: 0,
    totalPurchaseAmount: 0,
    categoriesViewed: [],
    lastActiveAt: Date.now(),
    churnScore: 0.8,
    affinityScores: {},
    segments: []
};

// the trigger you created
const trigger: TriggerDefinition = {
    name: "Churn Risk Alert",
    active: true,
    condition: {
        churnScore: { $gt: 0.7 },
    },
    action: {
        type: "log",
        message: "High churn risk user detected",
    },
};


async function test() {
    const evaluator = new TriggerEvaluator();
    const fired = await evaluator.evaluateTriggers(profile, [trigger]);
    console.log("Would fire?:", fired);
}

test();
