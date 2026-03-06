import pino from "pino";
import { getContext } from "../co-id/current-context";
export const appLogger = pino({
    level: process.env.LOG_LEVEL || "info",
    mixin() {
        try {
            const context = getContext();
            return context.requestId ? { requestId: context.requestId } : {}
        } catch {
            return {}
        }
    },
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname"
        }
    }
});