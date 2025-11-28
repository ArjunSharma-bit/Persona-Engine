import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProfile, UserProfileSchema } from './schema/profile.schema';
import { ProfileService } from './services/profile.service';
import { MlModule } from './ml/ml.module';
import { ProfileSegmentsController } from './controller/profile.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserProfile.name, schema: UserProfileSchema }]), MlModule,
    ],
    controllers: [ProfileSegmentsController],
    providers: [ProfileService],
    exports: [ProfileService],
})
export class ProfileModule { }
