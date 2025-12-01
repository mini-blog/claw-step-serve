import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeedbackDto {
  @ApiProperty({ description: '反馈ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '反馈内容', example: '您有任何建议或意见,欢迎反馈给我们,我们会尽快答复您!' })
  content: string;

  @ApiPropertyOptional({ description: '联系方式', example: 'user@example.com' })
  contact?: string;

  @ApiPropertyOptional({ description: '图片URL数组', type: [String], example: ['https://example.com/image1.jpg'] })
  imageUrls?: string[];

  @ApiProperty({ description: '反馈状态', enum: ['pending', 'reviewed', 'resolved'], example: 'pending' })
  status: string;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class CreateFeedbackResponseDto {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '反馈ID', example: 'uuid-string' })
  feedbackId: string;

  @ApiProperty({ description: '消息', example: '反馈提交成功，我们会尽快处理！' })
  message: string;
}

export class FeedbackListResponseDto {
  @ApiProperty({ description: '反馈列表', type: [FeedbackDto] })
  feedbacks: FeedbackDto[];
}
