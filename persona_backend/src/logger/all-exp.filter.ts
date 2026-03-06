import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { appLogger } from "./logger.service";


@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception instanceof HttpException ? exception.getStatus() : 500;

        appLogger.error({
            error: exception.message || exception,
            stack: exception.stack,
            path: request.url,
        });

        response.status(status).json({
            statusCode: status,
            message: exception.message || "Internal error"
        })
    }
}