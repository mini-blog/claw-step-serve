import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DoubaoService } from './services/doubao.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, DoubaoService],
  exports: [ChatService, DoubaoService],
})
export class ChatModule {}
