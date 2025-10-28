import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckPhoneDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号' })
  @ApiProperty({ description: '手机号', example: '13800138000' })
  phone: string;
}

export class OneClickLoginDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号' })
  @ApiProperty({ description: '手机号', example: '13800138000' })
  phone: string;
  
  @IsNotEmpty({ message: 'accessToken不能为空' })
  @IsString()
  @ApiProperty({ description: '移动商SDK返回的accessToken' })
  accessToken: string;
}

export class PhoneCodeLoginDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号' })
  @ApiProperty({ description: '手机号', example: '13800138000' })
  phone: string;
  
  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString()
  @Length(4, 6, { message: '验证码长度应为4-6位' })
  @ApiProperty({ description: '短信验证码', example: '123456' })
  code: string;
}

export class SendSmsCodeDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号' })
  @ApiProperty({ description: '手机号', example: '13800138000' })
  phone: string;
}
