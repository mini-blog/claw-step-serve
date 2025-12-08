import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { FriendDto, FriendListResponseDto, InvitationCodeResponseDto } from './dto/friendship-response.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../user/user.service';

@Injectable()
export class FriendshipService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService
    ) { }

    /**
     * 检查用户是否为Pro用户
     * @param userId 用户ID
     * @throws ForbiddenException 如果不是Pro用户
     */
    private async checkProUser(userId: string): Promise<void> {
        const isPro = await this.userService.calculateIsProStatus(userId);
        if (!isPro) {
            throw new ForbiddenException('此功能需要Pro会员，请先开通Pro版本');
        }
    }

    /**
     * 定时任务：每小时检查并删除过期的好友删除请求
     */
    @Cron(CronExpression.EVERY_HOUR)
    async handleExpiredDeleteRequests() {
        const now = new Date();

        // 查找所有过期的删除请求
        const expiredFriendships = await this.prisma.friendship.findMany({
            where: {
                status: 'pending_delete',
                deleteExpiresAt: {
                    lte: now
                }
            }
        });

        if (expiredFriendships.length > 0) {
            // 永久删除这些好友关系
            await this.prisma.friendship.deleteMany({
                where: {
                    id: {
                        in: expiredFriendships.map(f => f.id)
                    }
                }
            });
            console.log(`Deleted ${expiredFriendships.length} expired friendships`);
        }
    }

    /**
     * 生成唯一的邀请码
     * @returns 8位字母数字组合
     */
    private generateUniqueCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * 生成或重新生成用户的邀请码
     * @param userId 用户ID
     * @returns 邀请码信息
     */
    async generateInvitationCode(userId: string): Promise<InvitationCodeResponseDto> {
        // 检查是否为Pro用户
        await this.checkProUser(userId);
        // 生成唯一码，确保不重复
        let code = this.generateUniqueCode();
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const existing = await this.prisma.user.findUnique({
                where: { friendInvitationCode: code }
            });

            if (!existing) {
                break;
            }

            code = this.generateUniqueCode();
            attempts++;
        }

        if (attempts >= maxAttempts) {
            throw new BadRequestException('生成邀请码失败，请重试');
        }

        // 更新用户的邀请码
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                friendInvitationCode: code,
                friendCodeCreatedAt: new Date()
            }
        });

        return {
            invitationCode: code,
            createdAt: updatedUser.friendCodeCreatedAt!
        };
    }

    /**
     * 获取用户当前的邀请码
     * @param userId 用户ID
     * @returns 邀请码信息，如果没有则返回null
     */
    async getMyInvitationCode(userId: string): Promise<InvitationCodeResponseDto | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                friendInvitationCode: true,
                friendCodeCreatedAt: true
            }
        });

        if (!user?.friendInvitationCode) {
            return null;
        }

        return {
            invitationCode: user.friendInvitationCode,
            createdAt: user.friendCodeCreatedAt!
        };
    }

    /**
     * 通过邀请码添加好友
     * @param userId 当前用户ID
     * @param invitationCode 好友的邀请码
     * @returns 新添加的好友信息
     */
    async addFriendByCode(userId: string, invitationCode: string): Promise<FriendDto> {
        // 检查是否为Pro用户
        await this.checkProUser(userId);
        // 查找拥有该邀请码的用户
        const friendUser = await this.prisma.user.findUnique({
            where: { friendInvitationCode: invitationCode },
            select: {
                id: true,
                nickname: true,
                avatar: true
            }
        });

        if (!friendUser) {
            throw new NotFoundException('邀请码不存在');
        }

        if (friendUser.id === userId) {
            throw new BadRequestException('不能添加自己为好友');
        }

        // 检查是否已经是好友
        const existingFriendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId, friendId: friendUser.id },
                    { userId: friendUser.id, friendId: userId }
                ]
            }
        });

        if (existingFriendship) {
            if (existingFriendship.status === 'pending_delete') {
                throw new BadRequestException('该好友关系正在删除中，请等待24小时后重新添加');
            }
            throw new BadRequestException('已经是好友关系');
        }

        // 创建双向好友关系
        const [friendship1, friendship2] = await this.prisma.$transaction([
            this.prisma.friendship.create({
                data: {
                    userId,
                    friendId: friendUser.id,
                    status: 'active'
                }
            }),
            this.prisma.friendship.create({
                data: {
                    userId: friendUser.id,
                    friendId: userId,
                    status: 'active'
                }
            })
        ]);

        return {
            id: friendUser.id,
            nickname: friendUser.nickname || '用户',
            avatar: friendUser.avatar || undefined,
            friendshipId: friendship1.id,
            friendSince: friendship1.createdAt
        };
    }

    /**
     * 获取用户的好友列表
     * @param userId 用户ID
     * @returns 好友列表
     */
    async getMyFriends(userId: string): Promise<FriendListResponseDto> {
        // 从Friendship表中获取所有active和pending_delete状态的好友（pending_delete用于显示取消解绑按钮）
        const friendships = await this.prisma.friendship.findMany({
            where: {
                userId,
                status: {
                    in: ['active', 'pending_delete']
                }
            },
            include: {
                friend: {
                    select: {
                        id: true,
                        nickname: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const friends: FriendDto[] = friendships.map(friendship => ({
            id: friendship.friend.id,
            nickname: friendship.friend.nickname || '用户',
            avatar: friendship.friend.avatar || undefined,
            friendshipId: friendship.id,
            friendSince: friendship.createdAt,
            status: friendship.status,
            deleteRequestedAt: friendship.deleteRequestedAt || undefined,
            deleteExpiresAt: friendship.deleteExpiresAt || undefined
        }));

        return {
            friends
        };
    }

    /**
     * 删除好友（进入24小时等待期）
     * @param userId 当前用户ID
     * @param friendshipId 好友关系ID
     */
    async deleteFriend(userId: string, friendshipId: string): Promise<void> {
        // 查找好友关系
        const friendship = await this.prisma.friendship.findUnique({
            where: { id: friendshipId }
        });

        if (!friendship) {
            throw new NotFoundException('好友关系不存在');
        }

        if (friendship.userId !== userId) {
            throw new BadRequestException('无权删除此好友关系');
        }

        if (friendship.status === 'pending_delete') {
            throw new BadRequestException('该好友已在删除等待期');
        }

        const now = new Date();
        const deleteExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24小时后

        // 查找对方的好友关系
        const reverseFriendship = await this.prisma.friendship.findFirst({
            where: {
                userId: friendship.friendId,
                friendId: userId
            }
        });

        // 更新双方的好友关系状态
        await this.prisma.$transaction([
            this.prisma.friendship.update({
                where: { id: friendshipId },
                data: {
                    status: 'pending_delete',
                    deleteRequestedAt: now,
                    deleteExpiresAt
                }
            }),
            ...(reverseFriendship ? [
                this.prisma.friendship.update({
                    where: { id: reverseFriendship.id },
                    data: {
                        status: 'pending_delete',
                        deleteRequestedAt: now,
                        deleteExpiresAt
                    }
                })
            ] : [])
        ]);
    }

    /**
     * 取消删除好友（24小时内）
     * @param userId 当前用户ID
     * @param friendshipId 好友关系ID
     */
    async cancelDeleteFriend(userId: string, friendshipId: string): Promise<void> {
        // 查找好友关系
        const friendship = await this.prisma.friendship.findUnique({
            where: { id: friendshipId }
        });

        if (!friendship) {
            throw new NotFoundException('好友关系不存在');
        }

        if (friendship.userId !== userId) {
            throw new BadRequestException('无权操作此好友关系');
        }

        if (friendship.status !== 'pending_delete') {
            throw new BadRequestException('该好友关系未在删除等待期');
        }

        // 检查是否已过期
        if (friendship.deleteExpiresAt && new Date() > friendship.deleteExpiresAt) {
            throw new BadRequestException('删除等待期已过，无法取消');
        }

        // 查找对方的好友关系
        const reverseFriendship = await this.prisma.friendship.findFirst({
            where: {
                userId: friendship.friendId,
                friendId: userId
            }
        });

        // 恢复双方的好友关系
        await this.prisma.$transaction([
            this.prisma.friendship.update({
                where: { id: friendshipId },
                data: {
                    status: 'active',
                    deleteRequestedAt: null,
                    deleteExpiresAt: null
                }
            }),
            ...(reverseFriendship ? [
                this.prisma.friendship.update({
                    where: { id: reverseFriendship.id },
                    data: {
                        status: 'active',
                        deleteRequestedAt: null,
                        deleteExpiresAt: null
                    }
                })
            ] : [])
        ]);
    }

    /**
     * 验证邀请码是否有效
     * @param code 邀请码
     * @param userId 当前用户ID（用于检查是否是自己）
     * @returns 邀请者信息
     */
    async validateInvitationCode(code: string, userId: string): Promise<{ id: string; nickname: string; avatar?: string }> {
        const inviter = await this.prisma.user.findUnique({
            where: { friendInvitationCode: code },
            select: {
                id: true,
                nickname: true,
                avatar: true
            }
        });

        if (!inviter) {
            throw new NotFoundException('邀请码不存在');
        }

        if (inviter.id === userId) {
            throw new BadRequestException('不能使用自己的邀请码');
        }

        // 检查是否已经是好友
        const existingFriendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId, friendId: inviter.id },
                    { userId: inviter.id, friendId: userId }
                ],
                status: 'active'
            }
        });

        if (existingFriendship) {
            throw new BadRequestException('已经是好友关系');
        }

        return {
            id: inviter.id,
            nickname: inviter.nickname || '用户',
            avatar: inviter.avatar || undefined
        };
    }
}
