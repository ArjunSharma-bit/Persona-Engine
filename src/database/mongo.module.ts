import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGO_URL || "mongodb://mongo1:27017,mongo2:27018,mongo3:27019/personalization?replicaSet=rs0", {
            serverSelectionTimeoutMS: 5000,
            retryAttempts: 5,
            retryDelay: 2000,
        }),
    ],
})
export class MongoModule { }
