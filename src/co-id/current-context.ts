
import { AsyncLocalStorage } from "async_hooks";

const als = new AsyncLocalStorage<any>();

export function runWithContext(context: any, callback: () => any) {
    als.run(context, callback);
}

export function getContext() {
    return als.getStore() || {};
}
