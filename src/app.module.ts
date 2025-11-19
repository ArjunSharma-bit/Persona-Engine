import { Module } from '@nestjs/common';
import { EventModule } from './event.module'

@Module({
    imports: [EventModule],
})
export class AppModule { }
