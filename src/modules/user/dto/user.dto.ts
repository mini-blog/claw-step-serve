import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

// 用户资料响应DTO
export class UserProfileResponseDto {
  @ApiProperty({ description: '用户ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '昵称', example: '假装看风景' })
  nickname: string;

  @ApiProperty({ description: '头像URL', example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '是否为Pro用户', example: false })
  isPro: boolean;

  @ApiProperty({ description: '旅行券数量', example: 0 })
  travelTickets: number;

  @ApiProperty({ description: '语言设置', example: 'zh-CN' })
  language: string;

  @ApiPropertyOptional({ description: '邮箱', example: 'user@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

// 创建用户DTO（小程序用户）
export type TPostUserInfoDto = {
  openid: string;
  nickname?: string;
  avatar?: string;
};

// 更新用户资料DTO（支持部分更新）
export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: '昵称',
    example: '假装看风景',
    required: false,
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({
    description: '头像文件',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  avatar?: any; // 文件字段，用于 Swagger 文档，实际文件通过 @UploadedFile() 处理
}
