import { NestFactory } from "@nestjs/core"
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    await app.listen(3000, '0.0.0.0');
    console.log('I am Here http://localhost:4000');
}
bootstrap();