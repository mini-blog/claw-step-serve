import { ApiProperty } from '@nestjs/swagger';

export class GenerateInvitationResponseDto {
  @ApiProperty({ description: '邀请码', example: 'ABC12345' })
  invitationCode: string;

  @ApiProperty({ description: '过期时间', example: '2024-01-08T00:00:00.000Z' })
  expiresAt: string;

  @ApiProperty({ description: '二维码URL', example: 'https://example.com/qr/ABC12345', required: false })
  qrCodeUrl?: string;
}

export class ValidateInvitationSuccessResponseDto {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '邀请信息' })
  data: {
    invitationId: string;
    inviter: {
      id: string;
      nickname: string;
      avatar: string;
    };
  };
}

export class ValidateInvitationErrorResponseDto {
  @ApiProperty({ description: '是否成功', example: false })
  success: boolean;

  @ApiProperty({ description: '错误信息' })
  error: {
    code: string;
    message: string;
  };
}

export class AcceptInvitationResponseDto {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '旅伴关系信息' })
  data: {
    partnershipId: string;
    partner: {
      id: string;
      nickname: string;
      avatar: string;
    };
    createdAt: string;
  };
}

export class PartnershipDto {
  @ApiProperty({ description: '旅伴关系ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '旅伴信息' })
  partner: {
    id: string;
    nickname: string;
    avatar: string;
  };

  @ApiProperty({ description: '关系状态', example: 'accepted' })
  status: string;

  @ApiProperty({ description: '是否有正在进行的旅行', example: false })
  isActiveTravel: boolean;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: '接受时间', example: '2024-01-01T00:00:00.000Z', required: false })
  acceptedAt?: string;

  @ApiProperty({ description: '解除请求过期时间', example: '2024-01-02T00:00:00.000Z', required: false })
  unbindExpiresAt?: string;
}

export class PartnershipsResponseDto {
  @ApiProperty({ description: '旅伴关系列表', type: [PartnershipDto] })
  partnerships: PartnershipDto[];
}

export class UnbindResponseDto {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '解除请求信息' })
  data: {
    partnershipId: string;
    expiresAt: string;
  };
}

export class CancelUnbindResponseDto {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;
}

