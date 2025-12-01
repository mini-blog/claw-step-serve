import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  TRAVEL_INVITATION = 'travel_invitation',
  ACTIVITY_PROMOTION = 'activity_promotion',
  SYSTEM = 'system',
}

export class CreateNotificationDto {
  @ApiProperty({ description: '用户ID', example: 'uuid-string' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: '通知标题', example: '成为好友' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '通知内容', example: '假装看风景 已经接受了您的好友邀请,可以双人旅行啦!' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '通知类型', enum: NotificationType, example: NotificationType.FRIEND_REQUEST })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ description: '通知头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '通知图片URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '行动链接' })
  @IsOptional()
  @IsString()
  actionLink?: string;
}

export class MarkAsReadDto {
  @ApiProperty({ description: '通知ID', example: 'uuid-string' })
  @IsNotEmpty()
  @IsString()
  notificationId: string;
}

