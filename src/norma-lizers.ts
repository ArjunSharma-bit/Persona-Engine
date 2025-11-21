import { EventType } from "./types/event-types";

export function normalizeEvent(type: EventType, data: any) {
    switch (type) {
        case 'product_view':
            return {
                productId: String(data.productId || ''),
                category: data.category || '',
                source: data.source || ''
            };

        case 'add_to_cart':
            return {
                productId: String(data.productId || ''),
                quantity: Number(data.quantity || ''),
                price: Number(data.price || 0)
            };

        case 'search':
            return {
                query: String(data.query || ''),
                filter: data.filter || '',
                resultCount: Number(data.resultCount || '')
            };

        case 'purchase':
            return {
                orderId: String(data.orderId || ''),
                amount: Number(data.amount || ''),
                items: Number(data.items || ''),
                paymentMethod: data.paymentMethod || 'Unknown',
            }

        case 'click':
            return {
                element: data.element || null,
                page: data.page || null,
            }

        case 'custom':
            return data || {}

        default:
            return data || {}
    }
}
