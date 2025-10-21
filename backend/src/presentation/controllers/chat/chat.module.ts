import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from '../../../application/services/chat.service';
import { DatabaseModule } from '../../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
