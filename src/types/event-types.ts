export type EventType =
    | 'product_view'
    | 'search'
    | 'add_to_cart'
    | 'purchase'
    | 'session_start'
    | 'session_end'
    | 'app_open'
    | 'click'
    | 'custom';

export interface EventPayload {
    userId: string;
    type: EventType;
    data: Record<string, any>;
    timestamp: number;
    reqId?: string | null;
    requestId?: string | null;
    replayMode?: 'dry-run' | 'recompute' | 'profile-only' | 'triggers-only';
}