import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateInvitationDto {
  @IsNotEmpty({ message: '邀请码不能为空' })
  @IsString()
  @ApiProperty({ description: '邀请码', example: 'ABC12345' })
  invitationCode: string;
}

export class AcceptInvitationDto {
  @IsNotEmpty({ message: '邀请码不能为空' })
  @IsString()
  @ApiProperty({ description: '邀请码', example: 'ABC12345' })
  invitationCode: string;
}

export class CancelUnbindDto {
  @IsNotEmpty({ message: '解除请求ID不能为空' })
  @IsString()
  @ApiProperty({ description: '解除请求ID', example: 'uuid-string' })
  partnershipId: string;
}

