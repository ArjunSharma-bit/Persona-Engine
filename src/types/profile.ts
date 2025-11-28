export interface Profile {
    userId: string;
    totalEvents: number;
    sessionCount: number;
    totalPurchaseAmount: number;
    categoriesViewed: string[];
    lastSeenProduct?: string;
    segments: string[];
    churnScore: number;
    affinityScores: Record<string, number>;
    lastActiveAt: number;
}

export type ComparisonOperators =
    | { $gt: number }
    | { $lt: number }
    | { $eq: any }
    | { $neq: any };

export type ConditionValue =
    | ComparisonOperators
    | string
    | number;

export type TriggerCondition = Record<string, ConditionValue>;

export type TriggerAction =
    | {
        type: "log";
        message: string;
    }
    | {
        type: "webhook";
        url: string;
        message: string;
    };

export interface TriggerDefinition {
    name: string;
    condition: TriggerCondition;
    action: TriggerAction;
    active: boolean;
}

