import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, MaxLength, IsUrl } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ description: '反馈内容', example: '您有任何建议或意见,欢迎反馈给我们,我们会尽快答复您!', maxLength: 400 })
  @IsNotEmpty({ message: '反馈内容不能为空' })
  @IsString()
  @MaxLength(400, { message: '反馈内容不能超过400个字符' })
  content: string;

  @ApiPropertyOptional({ description: '联系方式（邮箱或手机）', example: 'user@example.com' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({ description: '图片URL数组（支持多张截图）', type: [String], example: ['https://example.com/image1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true, message: '图片URL格式不正确' })
  imageUrls?: string[];
}

