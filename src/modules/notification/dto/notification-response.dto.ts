import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({ description: '通知ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '通知标题', example: '成为好友' })
  title: string;

  @ApiProperty({ description: '通知内容', example: '假装看风景 已经接受了您的好友邀请,可以双人旅行啦!' })
  content: string;

  @ApiProperty({ description: '通知类型', enum: ['friend_request', 'travel_invitation', 'activity_promotion', 'system'], example: 'friend_request' })
  type: string;

  @ApiPropertyOptional({ description: '通知头像URL', example: 'https://example.com/avatar.jpg' })
  avatar?: string;

  @ApiPropertyOptional({ description: '通知图片URL', example: 'https://example.com/image.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({ description: '行动链接', example: '点击立即参与' })
  actionLink?: string;

  @ApiProperty({ description: '是否已读', example: false })
  isRead: boolean;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({ description: '通知列表', type: [NotificationDto] })
  notifications: NotificationDto[];

  @ApiProperty({ description: '未读数量', example: 5 })
  unreadCount: number;

  @ApiProperty({ description: '总数', example: 20 })
  total: number;
}

export class MarkAsReadResponseDto {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '消息', example: '标记已读成功' })
  message: string;
}

export class UnreadCountResponseDto {
  @ApiProperty({ description: '未读数量', example: 5 })
  count: number;
}
