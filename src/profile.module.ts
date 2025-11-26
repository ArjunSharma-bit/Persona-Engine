import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProfile, UserProfileSchema } from './schema/profile.schema';
import { ProfileService } from './services/profile.service';
import { MlModule } from './ml/ml.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserProfile.name, schema: UserProfileSchema }]), MlModule
    ],
    providers: [ProfileService],
    exports: [ProfileService, MongooseModule],
})
export class ProfileModule { }
