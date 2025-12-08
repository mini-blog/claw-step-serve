import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddHistoryItemDto {
  @ApiProperty({ description: '关联的模版项ID' })
  @IsString()
  templateItemId: string;

  @ApiPropertyOptional({ description: '角色', enum: ['user', 'pet'] })
  @IsOptional()
  @IsString()
  role?: 'user' | 'pet';

  @ApiPropertyOptional({ description: '用户输入的文本' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: '媒体类型', enum: ['text', 'audio', 'video', 'image', 'none'] })
  @IsOptional()
  @IsString()
  mediaType?: string;

  @ApiPropertyOptional({ description: '媒体链接列表' })
  @IsOptional()
  @IsArray()
  mediaUrls?: string[];
}

