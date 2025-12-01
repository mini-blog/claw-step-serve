import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ description: '用户ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '手机号', example: '13800138000' })
  phone: string;

  @ApiProperty({ description: '昵称', example: '用户昵称' })
  nickname: string;

  @ApiProperty({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  avatar: string;

  @ApiProperty({ description: '是否为Pro用户', example: false })
  isPro: boolean;

  @ApiProperty({ description: '语言设置', example: 'zh-CN' })
  language: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: '访问令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ description: '是否为新用户', example: false })
  isNew: boolean;
}

export class CheckPhoneResponseDto {
  @ApiProperty({ description: '手机号是否已注册', example: true })
  exists: boolean;

  @ApiProperty({ description: '用户信息（如果已注册）', type: UserInfoDto, required: false })
  user?: UserInfoDto;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ description: '新的访问令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: '新的刷新令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

