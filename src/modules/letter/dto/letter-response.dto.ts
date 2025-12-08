import { ApiProperty } from '@nestjs/swagger';

// 列表项 DTO
export class LetterListItemDto {
  @ApiProperty({ description: '信件ID' })
  id: string;

  @ApiProperty({ description: '标题（取第一条消息的前20个字）' })
  title: string;

  @ApiProperty({ description: '发件人（宠物名）' })
  author: string;

  @ApiProperty({ description: '发件人头像（宠物头像）' })
  authorAvatar: string;

  @ApiProperty({ description: '信件类型（aiSong/aiDrawing/aiHoroscope）' })
  type: string;

  @ApiProperty({ description: '是否已读' })
  isRead: boolean;

  @ApiProperty({ description: '是否已完结' })
  isCompleted: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

// 列表响应 DTO
export class LetterListResponseDto {
  @ApiProperty({ description: '信件列表', type: [LetterListItemDto] })
  letters: LetterListItemDto[];

  @ApiProperty({ description: '总数' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;
}

// 信箱状态响应 DTO
export class MailboxStatusResponseDto {
  @ApiProperty({ description: '未读消息总数' })
  unreadCount: number;

  @ApiProperty({ description: '未读消息ID列表', type: [String] })
  unreadIds: string[];
}

// 信件详情及模板 DTO
export class LetterDetailWithTemplateDto {
  @ApiProperty({ description: '信件ID' })
  id: string;

  @ApiProperty({ description: '信件类型' })
  type: string;

  @ApiProperty({ description: '是否已完结' })
  isCompleted: boolean;

  @ApiProperty({ description: '交互历史（仅记录顺序和ID）' })
  history: any[]; 

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '完整模板内容（用于前端渲染）' })
  templateContent: any[]; 
}
