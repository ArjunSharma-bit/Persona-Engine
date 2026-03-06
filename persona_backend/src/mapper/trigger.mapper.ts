import { TriggerAction, TriggerDefinition } from "../types/profile";

export function mapMongoTrigger(docs: any[]): TriggerDefinition[] {
    return docs.map(doc => {
        const obj = doc.toObject();

        const action: TriggerAction = obj.action.type === 'webhook' ? {
            type: 'webhook',
            url: obj.action.url,
            message: obj.action.message,
        } : {
            type: 'log',
            message: obj.action.message,
        }

        return {
            name: obj.name, condition: obj.condition, action, active: obj.active
        };
    });
}