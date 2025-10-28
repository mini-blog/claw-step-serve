import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostLoginDto{
  @IsNotEmpty({ message: 'code不能为空' })
  @ApiProperty({ description: '登录code' })
  code: string;
}

export class RegisterDto{
  @IsNotEmpty({ message: 'code不能为空' })
  @ApiProperty({ description: '注册code' })
  code: string;

  @IsNotEmpty({ message: '名称不能为空' })
  @ApiProperty({ description: '用户名称' })
  userName: string;

  @IsNotEmpty({ message: '头像不能为空' })
  @ApiProperty({ description: '用户头像' })
  userIcon: string;

  @IsNotEmpty({ message: '性别不能为空' })
  @ApiProperty({ description: '用户性别' })
  sex: 0|1;
  
  @ApiProperty({ description: '用户手机号码' })
  telephone: string;

  @ApiProperty({ description: '用户生日' })
  @IsNotEmpty({ message: '生日不能为空' })
  birthday: string;
}
