import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 抖音登录DTO
 */
export class DouyinLoginDto {
  @IsNotEmpty({ message: 'accessToken不能为空' })
  @IsString()
  @ApiProperty({ 
    description: '抖音授权accessToken', 
    example: 'douyin_access_token_here' 
  })
  accessToken: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    description: '抖音用户ID（openid）', 
    required: false,
    example: 'douyin_openid_here' 
  })
  openid?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    description: '抖音用户昵称', 
    required: false,
    example: '抖音用户' 
  })
  nickname?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    description: '抖音用户头像URL', 
    required: false,
    example: 'https://example.com/avatar.jpg' 
  })
  avatar?: string;
}

/**
 * Apple登录DTO
 */
export class AppleLoginDto {
  @IsNotEmpty({ message: 'identityToken不能为空' })
  @IsString()
  @ApiProperty({ 
    description: 'Apple ID token (JWT)', 
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  identityToken: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    description: 'Apple用户标识（user identifier）', 
    required: false,
    example: 'apple_user_id_here' 
  })
  userIdentifier?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    description: 'Apple用户邮箱', 
    required: false,
    example: 'user@example.com' 
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ 
    description: 'Apple用户全名', 
    required: false,
    example: 'John Doe' 
  })
  fullName?: string;
}

