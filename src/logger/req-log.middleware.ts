import { Injectable, NestMiddleware } from "@nestjs/common";
import { appLogger } from "./logger.service";


@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const start = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - start;
            appLogger.info({
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration,
            });
        });
        next();
    }
}