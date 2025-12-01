import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core/modules';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AgreementModule } from './modules/agreement/agreement.module';
import { PetModule } from './modules/pet/pet.module';
import { CityModule } from './modules/city/city.module';
import { TravelModule } from './modules/travel/travel.module';
import { HomeModule } from './modules/home/home.module';
import { LetterModule } from './modules/letter/letter.module';
import { ChatModule } from './modules/chat/chat.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    CoreModule,
    // 业务模块
    AuthModule,
    UserModule,
    AgreementModule,
    PetModule,
    CityModule,
    TravelModule,
    HomeModule,
    LetterModule,
    ChatModule,
    SubscriptionModule,
    CouponModule,
    NotificationModule,
    FeedbackModule,
    UploadModule,
  ],
})
export class AppModule { }
