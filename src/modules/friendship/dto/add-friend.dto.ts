import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AddFriendDto {
    @ApiProperty({ description: '好友邀请码（8位字符）', example: 'ABC12345' })
    @IsNotEmpty({ message: '邀请码不能为空' })
    @IsString({ message: '邀请码必须是字符串' })
    @Length(8, 8, { message: '邀请码必须是8位字符' })
    invitationCode: string;
}
