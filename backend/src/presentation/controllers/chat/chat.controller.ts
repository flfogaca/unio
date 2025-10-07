import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService, CreateChatMessageDto } from '../../../application/services/chat.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  async createMessage(
    @Body() body: CreateChatMessageDto,
    @CurrentUser() user: any,
  ) {
    console.log('💬 API: Recebendo mensagem:', body);
    console.log('👤 API: Usuário:', user.id, user.name);
    
    const message = await this.chatService.createMessage(body);
    
    console.log('✅ API: Mensagem salva:', message.id);
    
    return {
      success: true,
      data: message,
    };
  }

  @Get('messages/:consultationId')
  async getMessages(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('since') since?: string,
  ) {
    console.log('📥 API: Buscando mensagens para consulta:', consultationId);
    console.log('👤 API: Usuário:', user.id, user.name);
    
    let messages;
    
    if (since) {
      const sinceDate = new Date(since);
      messages = await this.chatService.getMessagesSince(consultationId, sinceDate);
      console.log('🔄 API: Mensagens novas desde', sinceDate, ':', messages.length);
    } else {
      const limitNum = limit ? parseInt(limit, 10) : 100;
      messages = await this.chatService.getMessages(consultationId, limitNum);
      console.log('📋 API: Total de mensagens:', messages.length);
    }
    
    return {
      success: true,
      data: messages,
    };
  }
}

