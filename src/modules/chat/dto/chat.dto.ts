import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsBoolean } from 'class-validator';

// 创建会话请求
export class CreateSessionDto {
  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  @IsString()
  petId: string;
}

// 发送文字消息请求
export class SendTextMessageDto {
  @ApiPropertyOptional({ description: '会话ID（可选，如果不提供会自动创建或获取）', example: 'uuid-string' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  @IsString()
  petId: string;

  @ApiProperty({ description: '消息内容', example: '你好，今天天气怎么样？' })
  @IsString()
  content: string;
}

// 发送图片消息请求
export class SendImageMessageDto {
  @ApiPropertyOptional({ description: '会话ID（可选）', example: 'uuid-string' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  @IsString()
  petId: string;

  @ApiProperty({ description: '图片URL', example: 'https://example.com/image.jpg' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: '文字内容（可选）', example: '看看这张照片' })
  @IsOptional()
  @IsString()
  content?: string;
}

// 发送语音消息请求
export class SendVoiceMessageDto {
  @ApiPropertyOptional({ description: '会话ID（可选）', example: 'uuid-string' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  @IsString()
  petId: string;

  @ApiProperty({ description: '语音文件URL', example: 'https://example.com/voice.mp3' })
  @IsString()
  voiceUrl: string;

  @ApiProperty({ description: '语音时长（秒）', example: 5 })
  @IsNumber()
  duration: number;
}

// 结束会话请求
export class EndSessionDto {
  @ApiProperty({ description: '会话ID', example: 'uuid-string' })
  @IsString()
  sessionId: string;
}
