import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@prisma/client';

export type TPostUserInfoDto = Readonly<Pick<User, 'openid' | 'email' | 'phone' | 'username' | 'nickname' | 'avatar' | 'language' | 'isPro'>> 

// 新增：更新用户资料DTO（支持部分更新）
export class UpdateUserProfileDto {
  @ApiPropertyOptional({ description: '昵称', example: '假装看风景', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '昵称长度不能超过20个字符' })
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;
}

// 保留旧的 PutUserInfoDto 用于兼容（如果需要）
export class PutUserInfoDto {

  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '用户头像' })
  @IsString()
  avatar: string;

  @ApiProperty({ description: '昵称' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '语言' })
  @IsString()
  language: string;
}

// 新增：用户资料响应DTO
export class UserProfileResponseDto {
  @ApiProperty({ description: '用户ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '用户ID（显示用）', example: '43455483' })
  displayId: string; // 基于id生成的短ID

  @ApiPropertyOptional({ description: '用户名', example: 'username' })
  username?: string;

  @ApiProperty({ description: '昵称', example: '假装看风景' })
  nickname: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  avatar?: string;

  @ApiProperty({ description: '是否为Pro用户', example: true })
  isPro: boolean;

  @ApiProperty({ description: '旅行券数量', example: 3 })
  travelTickets: number;

  @ApiProperty({ description: '语言设置', example: 'zh_CN' })
  language: string;

  @ApiPropertyOptional({ description: '邮箱' })
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  phone?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
