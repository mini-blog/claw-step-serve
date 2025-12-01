import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 回复项
export class LetterReplyItemDto {
  @ApiProperty({ description: '回复ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '回复内容', example: '好啊，给我画一张' })
  content: string;

  @ApiProperty({ description: '媒体URLs', type: [String], example: ['https://example.com/image.jpg'] })
  mediaUrls: string[];

  @ApiProperty({ description: '媒体类型', example: 'singleImage' })
  mediaType: string;

  @ApiProperty({ description: '是否来自用户', example: true })
  isFromUser: boolean;

  @ApiPropertyOptional({ description: 'AI状态', enum: ['pending', 'processing', 'completed', 'failed'] })
  aiStatus?: string;

  @ApiPropertyOptional({ description: 'AI生成结果URL' })
  aiResultUrl?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

export class MarkReadDataVo {
  @ApiProperty({ description: '来信ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '是否已读', example: true })
  isRead: boolean;

  @ApiProperty({ description: '阅读时间' })
  readAt: Date;
}

export class ReplyDataVo {
  @ApiProperty({ description: '回复ID', example: 'uuid-string' })
  replyId: string;

  @ApiProperty({ description: '来信ID', example: 'uuid-string' })
  letterId: string;

  @ApiProperty({ description: '用户回复内容', type: () => LetterReplyItemDto })
  userReply: LetterReplyItemDto;

  @ApiProperty({ description: 'AI回复内容', type: () => LetterReplyItemDto })
  aiReply: LetterReplyItemDto & {
    estimatedTime?: number;
  };
}

// 来信列表项
export class LetterListItemDto {
  @ApiProperty({ description: '来信ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '来信标题', example: '排队三小时就为了吃这个？人类的钱真是太...' })
  title: string;

  @ApiProperty({ description: '作者（宠物名称）', example: '艾迪' })
  author: string;

  @ApiProperty({ description: '日期', example: '2025-09-12' })
  date: string;

  @ApiProperty({ description: '是否未读', example: true })
  isUnread: boolean;

  @ApiProperty({ description: '来信类型', enum: ['aiDrawing', 'aiSong', 'aiHoroscope'], example: 'aiDrawing' })
  letterType: string;

  @ApiProperty({ description: '图片URL（第一张图片或宠物头像）', example: 'https://example.com/image.jpg' })
  imageUrl: string;

  @ApiProperty({ description: '是否已交互', example: false })
  hasInteracted: boolean;
}

// 来信列表响应
export class LetterListResponseDto {
  @ApiProperty({ description: '来信列表', type: [LetterListItemDto] })
  letters: LetterListItemDto[];

  @ApiProperty({ description: '未读数量', example: 2 })
  unreadCount: number;
}

// 来信详情响应
export class LetterDetailResponseDto {
  @ApiProperty({ description: '来信ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '来信标题', example: '猜一猜，我这是在哪里？' })
  title: string;

  @ApiProperty({ description: '作者（宠物名称）', example: '艾迪' })
  author: string;

  @ApiProperty({ description: '来信类型', enum: ['aiDrawing', 'aiSong', 'aiHoroscope'], example: 'aiDrawing' })
  type: string;

  @ApiProperty({ description: '来信内容', example: '这里是东门城楼，有一部分是可以上去走的...' })
  content: string;

  @ApiProperty({ description: '媒体URLs', type: [String] })
  mediaUrls: string[];

  @ApiProperty({ description: '媒体类型', example: 'fourImages' })
  mediaType: string;

  @ApiProperty({ description: '是否已读', example: true })
  isRead: boolean;

  @ApiProperty({ description: '是否已交互', example: false })
  hasInteracted: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '回复列表', type: [LetterReplyItemDto] })
  replies: LetterReplyItemDto[];
}

// 标记已读响应
export class MarkReadResponseDto {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '数据', type: MarkReadDataVo })
  data: MarkReadDataVo;
}

// 用户回复响应
export class ReplyResponseDto {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '数据', type: ReplyDataVo })
  data: ReplyDataVo;
}

// AI回复结果响应
export class AiReplyResultResponseDto {
  @ApiProperty({ description: '回复ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'AI状态', enum: ['pending', 'processing', 'completed', 'failed'] })
  aiStatus: string;

  @ApiProperty({ description: '回复内容', example: '这是为你生成的绘画作品！' })
  content: string;

  @ApiPropertyOptional({ description: 'AI生成结果URL', example: 'https://example.com/ai-generated-image.jpg' })
  aiResultUrl?: string;

  @ApiProperty({ description: '媒体URLs', type: [String] })
  mediaUrls: string[];

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

// 未读数量响应
export class UnreadCountResponseDto {
  @ApiProperty({ description: '未读数量', example: 2 })
  count: number;
}
