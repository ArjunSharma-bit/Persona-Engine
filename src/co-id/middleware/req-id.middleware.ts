import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { runWithContext } from "../current-context";

@Injectable()
export class ReqIdMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const requestId = randomUUID();

        req.requestId = requestId;
        res.setHeader("X-Request-Id", requestId)

        runWithContext({ requestId }, () => next())
    }
}