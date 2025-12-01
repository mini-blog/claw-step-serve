import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';

// 回复请求 DTO
export class ReplyLetterDto {
  @ApiProperty({ 
    description: '交互方式',
    enum: ['try', 'save'],
    example: 'try'
  })
  @IsEnum(['try', 'save'])
  action: 'try' | 'save';

  @ApiPropertyOptional({ 
    description: '用户回复文本',
    example: '好啊，给我画一张'
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ 
    description: '用户上传的图片URLs',
    type: [String],
    example: ['https://example.com/user-image.jpg']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({ 
    description: '额外数据（根据type不同有不同字段）',
    example: { songName: 'xxx', lyrics: 'xxx' }
  })
  @IsOptional()
  @IsObject()
  extraData?: Record<string, any>;
}
