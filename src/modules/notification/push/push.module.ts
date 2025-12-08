import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}

