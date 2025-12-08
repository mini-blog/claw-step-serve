import { Module } from '@nestjs/common';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';
import { PushModule } from '../notification/push/push.module';

@Module({
  imports: [PushModule],
  controllers: [LetterController],
  providers: [LetterService],
  exports: [LetterService],
})
export class LetterModule {}
