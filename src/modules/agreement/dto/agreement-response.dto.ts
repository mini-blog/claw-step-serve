import { ApiProperty } from '@nestjs/swagger';

export class AgreementResponseDto {
  @ApiProperty({ description: '协议标题', example: '用户协议' })
  title: string;

  @ApiProperty({ description: '协议内容', example: '欢迎您使用...' })
  content: string;

  @ApiProperty({ description: '语言代码', example: 'zh_CN' })
  language: string;

  @ApiProperty({ description: '版本号', example: '1.0' })
  version: string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: string;
}

