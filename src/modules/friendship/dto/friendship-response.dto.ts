import { ApiProperty } from '@nestjs/swagger';

export class FriendDto {
    @ApiProperty({ description: '好友用户ID' })
    id: string;

    @ApiProperty({ description: '好友昵称' })
    nickname: string;

    @ApiProperty({ description: '好友头像', required: false })
    avatar?: string;

    @ApiProperty({ description: '好友关系ID（用于删除操作）' })
    friendshipId: string;

    @ApiProperty({ description: '成为好友的时间' })
    friendSince: Date;

    @ApiProperty({ description: '好友关系状态', required: false })
    status?: string;

    @ApiProperty({ description: '删除请求时间', required: false })
    deleteRequestedAt?: Date;

    @ApiProperty({ description: '删除请求过期时间', required: false })
    deleteExpiresAt?: Date;
}

export class FriendListResponseDto {
    @ApiProperty({ description: '好友列表', type: [FriendDto] })
    friends: FriendDto[];
}

export class InvitationCodeResponseDto {
    @ApiProperty({ description: '邀请码' })
    invitationCode: string;

    @ApiProperty({ description: '邀请码创建时间' })
    createdAt: Date;
}
