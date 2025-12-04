import { NestFactory } from "@nestjs/core"
import { AppModule } from './app.module'
import { AllExceptionsFilter } from "./logger/all-exp.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new AllExceptionsFilter)

    //swagger
    const config = new DocumentBuilder()
        .setTitle("Persona Engine API")
        .setDescription("API documentation for events, profiles, analytics, trigger,and flags")
        .setVersion("1.0.0")
        .build()

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document)
    await app.listen(3000, '0.0.0.0');
    console.log('I am Here http://localhost:4000');
}
bootstrap();