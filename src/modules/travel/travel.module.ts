import { Module } from '@nestjs/common';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { InvitationService } from './invitation.service';
import { NotificationModule } from '../notification/notification.module';
import { PushModule } from '../notification/push/push.module';

@Module({
  imports: [NotificationModule, PushModule],
  controllers: [TravelController],
  providers: [TravelService, InvitationService],
  exports: [TravelService, InvitationService]
})
export class TravelModule {}
