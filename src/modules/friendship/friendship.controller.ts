import { Controller, Get, Post, Delete, Request, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FriendshipService } from './friendship.service';
import { FriendListResponseDto, InvitationCodeResponseDto, FriendDto } from './dto/friendship-response.dto';
import { AddFriendDto } from './dto/add-friend.dto';
import { ValidateCodeDto } from './dto/validate-code.dto';
import { ApiResult } from '@app/core/common';

@ApiTags('好友管理')
@Controller('friendship')
@ApiBearerAuth('JWT-auth')
export class FriendshipController {
    constructor(private readonly friendshipService: FriendshipService) { }

    @Get('my-friends')
    @ApiOperation({ summary: '获取我的好友列表' })
    @ApiResult(FriendListResponseDto)
    async getMyFriends(@Request() req: any): Promise<FriendListResponseDto> {
        const userId = req.user.id;
        return await this.friendshipService.getMyFriends(userId);
    }

    @Post('generate-code')
    @ApiOperation({ summary: '生成/重新生成邀请码（需要Pro用户）' })
    @ApiResult(InvitationCodeResponseDto)
    async generateInvitationCode(@Request() req: any): Promise<InvitationCodeResponseDto> {
        const userId = req.user.id;
        return await this.friendshipService.generateInvitationCode(userId);
    }

    @Get('my-code')
    @ApiOperation({ summary: '获取我的邀请码' })
    @ApiResult(InvitationCodeResponseDto)
    async getMyInvitationCode(@Request() req: any): Promise<InvitationCodeResponseDto | null> {
        const userId = req.user.id;
        return await this.friendshipService.getMyInvitationCode(userId);
    }

    @Post('validate-code')
    @ApiOperation({ summary: '验证邀请码（返回邀请者信息）' })
    @ApiResult(FriendDto)
    async validateInvitationCode(
        @Request() req: any,
        @Body() dto: ValidateCodeDto
    ): Promise<{ id: string; nickname: string; avatar?: string }> {
        const userId = req.user.id;
        return await this.friendshipService.validateInvitationCode(dto.invitationCode, userId);
    }

    @Post('add')
    @ApiOperation({ summary: '通过邀请码添加好友（需要Pro用户）' })
    @ApiResult(FriendDto)
    async addFriend(
        @Request() req: any,
        @Body() dto: AddFriendDto
    ): Promise<FriendDto> {
        const userId = req.user.id;
        return await this.friendshipService.addFriendByCode(userId, dto.invitationCode);
    }

    @Delete(':friendshipId')
    @ApiOperation({ summary: '删除好友（24小时等待期）' })
    @ApiParam({ name: 'friendshipId', description: '好友关系ID' })
    @ApiResult(Boolean)
    async deleteFriend(
        @Request() req: any,
        @Param('friendshipId') friendshipId: string
    ): Promise<boolean> {
        const userId = req.user.id;
        await this.friendshipService.deleteFriend(userId, friendshipId);
        return true;
    }

    @Post(':friendshipId/cancel-delete')
    @ApiOperation({ summary: '取消删除好友（24小时内）' })
    @ApiParam({ name: 'friendshipId', description: '好友关系ID' })
    @ApiResult(Boolean)
    async cancelDeleteFriend(
        @Request() req: any,
        @Param('friendshipId') friendshipId: string
    ): Promise<boolean> {
        const userId = req.user.id;
        await this.friendshipService.cancelDeleteFriend(userId, friendshipId);
        return true;
    }
}
