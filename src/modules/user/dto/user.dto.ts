import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export type TPostUserInfoDto = Readonly<Pick<User, 'openid' | 'email' | 'phone' | 'username' | 'nickname' | 'avatar' | 'language' | 'isPro'>> 

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
