import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import {
  CreateSessionResponseDto,
  SendMessageResponseDto,
  ChatHistoryResponseDto,
  ChatSessionDto,
  EndSessionResponseDto,
  SessionListResponseDto,
} from './dto/chat-response.dto';
import {
  CreateSessionDto,
  SendTextMessageDto,
  SendImageMessageDto,
  SendVoiceMessageDto,
} from './dto/chat.dto';
import { ApiResult, ErrorResponseDto } from '@app/core/common';

@ApiTags('chat')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({
    summary: '创建或获取聊天会话',
    description: '每个用户和宠物只有一个活跃会话，如果存在则返回，不存在则创建',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(CreateSessionResponseDto)
  @Post('session')
  async createOrGetSession(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: CreateSessionDto,
  ): Promise<CreateSessionResponseDto> {
    return await this.chatService.createOrGetSession(request.user.id, dto);
  }

  @ApiOperation({
    summary: '获取当前活跃会话',
    description: '获取指定宠物的当前活跃会话',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'petId', description: '宠物ID', required: true })
  @ApiResult(ChatSessionDto)
  @ApiResponse({ status: 404, description: '会话不存在', type: ErrorResponseDto })
  @Get('session/current')
  async getCurrentSession(
    @Request() request: Request & { user: { id: string } },
    @Query('petId') petId: string,
  ): Promise<ChatSessionDto | null> {
    return await this.chatService.getCurrentSession(request.user.id, petId);
  }

  @ApiOperation({
    summary: '发送文字消息',
    description: '发送文字消息并获取AI回复',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(SendMessageResponseDto)
  @Post('message/text')
  async sendTextMessage(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: SendTextMessageDto,
  ): Promise<SendMessageResponseDto> {
    return await this.chatService.sendTextMessage(request.user.id, dto);
  }

  @ApiOperation({
    summary: '发送图片消息',
    description: '发送图片消息（支持图片+文字）并获取AI回复',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(SendMessageResponseDto)
  @Post('message/image')
  async sendImageMessage(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: SendImageMessageDto,
  ): Promise<SendMessageResponseDto> {
    return await this.chatService.sendImageMessage(request.user.id, dto);
  }

  @ApiOperation({
    summary: '发送语音消息',
    description: '发送语音消息并获取AI语音回复',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(SendMessageResponseDto)
  @Post('message/voice')
  async sendVoiceMessage(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: SendVoiceMessageDto,
  ): Promise<SendMessageResponseDto> {
    return await this.chatService.sendVoiceMessage(request.user.id, dto);
  }

  @ApiOperation({
    summary: '获取聊天历史',
    description: '获取指定宠物的聊天消息历史',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'petId', description: '宠物ID', required: true })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, type: Number })
  @ApiQuery({ name: 'offset', description: '偏移量', required: false, type: Number })
  @ApiResult(ChatHistoryResponseDto)
  @Get('messages')
  async getChatHistory(
    @Request() request: Request & { user: { id: string } },
    @Query('petId') petId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<ChatHistoryResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return await this.chatService.getChatHistory(request.user.id, petId, limitNum, offsetNum);
  }

  @ApiOperation({
    summary: '结束聊天会话',
    description: '结束当前活跃的聊天会话',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: '会话ID' })
  @ApiResult(EndSessionResponseDto)
  @ApiResponse({ status: 404, description: '会话不存在或已结束', type: ErrorResponseDto })
  @Put('session/:id/end')
  async endSession(
    @Request() request: Request & { user: { id: string } },
    @Param('id') id: string,
  ): Promise<EndSessionResponseDto> {
    return await this.chatService.endSession(request.user.id, id);
  }

  @ApiOperation({
    summary: '获取会话列表',
    description: '获取用户的所有聊天会话列表',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, type: Number })
  @ApiQuery({ name: 'offset', description: '偏移量', required: false, type: Number })
  @ApiResult(SessionListResponseDto)
  @Get('sessions')
  async getSessions(
    @Request() request: Request & { user: { id: string } },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<SessionListResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return await this.chatService.getSessions(request.user.id, limitNum, offsetNum);
  }
}
