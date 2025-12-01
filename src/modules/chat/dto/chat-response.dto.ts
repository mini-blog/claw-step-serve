import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 聊天消息响应
export class ChatMessageDto {
  @ApiProperty({ description: '消息ID', example: 'uuid-string' })
  id: string;

  @ApiPropertyOptional({ description: '会话ID' })
  sessionId?: string;

  @ApiProperty({ description: '消息类型', enum: ['userText', 'userImage', 'userImageText', 'userVoice', 'petText'], example: 'userText' })
  type: string;

  @ApiProperty({ description: '消息内容', example: '你好，今天天气怎么样？' })
  content: string;

  @ApiProperty({ description: '媒体URLs', type: [String], example: [] })
  mediaUrls: string[];

  @ApiProperty({ description: '媒体类型', example: 'none' })
  mediaType: string;

  @ApiPropertyOptional({ description: '语音时长（秒）', example: 5 })
  duration?: number;

  @ApiProperty({ description: '是否来自用户', example: true })
  isFromUser: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

// 创建会话响应
export class CreateSessionResponseDto {
  @ApiProperty({ description: '会话ID', example: 'uuid-string' })
  sessionId: string;

  @ApiProperty({ description: '开始时间' })
  startTime: Date;

  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  petId: string;
}

// 发送消息响应
export class SendMessageResponseDto {
  @ApiProperty({ description: '用户消息', type: ChatMessageDto })
  userMessage: ChatMessageDto;

  @ApiProperty({ description: '宠物回复消息', type: ChatMessageDto })
  petMessage: ChatMessageDto;

  @ApiPropertyOptional({ description: '会话ID', example: 'uuid-string' })
  sessionId?: string;

  @ApiPropertyOptional({ description: '宠物语音URL（如果是语音消息）' })
  petVoiceUrl?: string;
}

// 聊天历史响应
export class ChatHistoryResponseDto {
  @ApiProperty({ description: '消息列表', type: [ChatMessageDto] })
  messages: ChatMessageDto[];

  @ApiProperty({ description: '总数量', example: 50 })
  total: number;

  @ApiPropertyOptional({ description: '会话ID' })
  sessionId?: string;
}

// 会话信息响应
export class ChatSessionDto {
  @ApiProperty({ description: '会话ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '用户ID', example: 'uuid-string' })
  userId: string;

  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  petId: string;

  @ApiProperty({ description: '开始时间' })
  startTime: Date;

  @ApiPropertyOptional({ description: '结束时间' })
  endTime?: Date;

  @ApiProperty({ description: '会话时长（秒）', example: 3600 })
  duration: number;

  @ApiProperty({ description: '消息总数', example: 50 })
  messageCount: number;

  @ApiProperty({ description: '用户消息数', example: 25 })
  userMessageCount: number;

  @ApiProperty({ description: '宠物消息数', example: 25 })
  petMessageCount: number;

  @ApiProperty({ description: '是否活跃', example: true })
  isActive: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

// 结束会话响应
export class EndSessionResponseDto {
  @ApiProperty({ description: '会话ID', example: 'uuid-string' })
  sessionId: string;

  @ApiProperty({ description: '会话时长（秒）', example: 3600 })
  duration: number;

  @ApiProperty({ description: '消息总数', example: 50 })
  messageCount: number;
}

// 获取会话列表响应
export class SessionListResponseDto {
  @ApiProperty({ description: '会话列表', type: [ChatSessionDto] })
  sessions: ChatSessionDto[];

  @ApiProperty({ description: '总数量', example: 10 })
  total: number;
}
