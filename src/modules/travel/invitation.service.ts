import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { PushService } from '../notification/push/push.service';
import { ValidateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import {
  GenerateInvitationResponseDto,
  ValidateInvitationSuccessResponseDto,
  ValidateInvitationErrorResponseDto,
  AcceptInvitationResponseDto,
  PartnershipDto,
  PartnershipsResponseDto,
  UnbindResponseDto,
  CancelUnbindResponseDto
} from './dto/invitation-response.dto';
import { NotificationType } from '../notification/dto/notification.dto';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class InvitationService {
  // 邀请码有效期7天
  private readonly INVITATION_EXPIRY_DAYS = 7;
  private readonly INVITATION_EXPIRY_MS = this.INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  
  // 解除请求有效期24小时
  private readonly UNBIND_EXPIRY_HOURS = 24;
  private readonly UNBIND_EXPIRY_MS = this.UNBIND_EXPIRY_HOURS * 60 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    private readonly pushService: PushService
  ) {}

  /**
   * 生成邀请码
   * @param userId 用户ID
   * @returns 邀请码信息
   */
  async generateInvitation(userId: string): Promise<GenerateInvitationResponseDto> {
    // 检查是否已有pending的邀请码
    const existingInvitation = await this.prisma.travelPartnership.findFirst({
      where: {
        inviterId: userId,
        status: 'pending',
        inviteeId: null
      }
    });

    if (existingInvitation) {
      // 检查是否过期
      const now = new Date();
      if (existingInvitation.expiresAt > now) {
        // 未过期，返回现有邀请码
        return {
          invitationCode: existingInvitation.invitationCode,
          expiresAt: existingInvitation.expiresAt.toISOString()
        };
      } else {
        // 已过期，删除旧记录
        await this.prisma.travelPartnership.delete({
          where: { id: existingInvitation.id }
        });
      }
    }

    // 生成新的邀请码
    const invitationCode = this.generateRandomCode();
    const expiresAt = new Date(Date.now() + this.INVITATION_EXPIRY_MS);

    // 创建邀请记录
    const partnership = await this.prisma.travelPartnership.create({
      data: {
        inviterId: userId,
        inviteeId: null,
        invitationCode,
        status: 'pending',
        expiresAt
      }
    });

    return {
      invitationCode: partnership.invitationCode,
      expiresAt: partnership.expiresAt.toISOString(),
      qrCodeUrl: `https://example.com/qr/${partnership.invitationCode}` // TODO: 实际生成二维码
    };
  }

  /**
   * 验证邀请码
   * @param dto 验证参数
   * @param userId 当前用户ID
   * @returns 验证结果
   */
  async validateInvitation(
    dto: ValidateInvitationDto,
    userId: string
  ): Promise<ValidateInvitationSuccessResponseDto | ValidateInvitationErrorResponseDto> {
    const partnership = await this.prisma.travelPartnership.findUnique({
      where: { invitationCode: dto.invitationCode },
      include: { inviter: true }
    });

    // 检查邀请码是否存在
    if (!partnership) {
      return {
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: '邀请码不存在'
        }
      };
    }

    // 检查是否已被接受
    if (partnership.status === 'accepted') {
      return {
        success: false,
        error: {
          code: 'CODE_USED',
          message: '邀请码已使用'
        }
      };
    }

    // 检查是否过期
    const now = new Date();
    if (partnership.expiresAt < now) {
      // 更新状态为过期
      await this.prisma.travelPartnership.update({
        where: { id: partnership.id },
        data: { status: 'expired' }
      });

      return {
        success: false,
        error: {
          code: 'CODE_EXPIRED',
          message: '邀请码已过期'
        }
      };
    }

    // 检查是否是自己邀请自己
    if (partnership.inviterId === userId) {
      return {
        success: false,
        error: {
          code: 'SELF_INVITATION',
          message: '不能接受自己的邀请'
        }
      };
    }

    // 检查是否已经有旅伴关系
    const existingPartnership = await this.prisma.travelPartnership.findFirst({
      where: {
        OR: [
          { inviterId: userId, inviteeId: partnership.inviterId },
          { inviterId: partnership.inviterId, inviteeId: userId }
        ],
        status: 'accepted'
      }
    });

    if (existingPartnership) {
      return {
        success: false,
        error: {
          code: 'ALREADY_PARTNERS',
          message: '你们已经是旅伴了'
        }
      };
    }

    return {
      success: true,
      data: {
        invitationId: partnership.id,
        inviter: {
          id: partnership.inviter.id,
          nickname: partnership.inviter.nickname || '旅伴',
          avatar: partnership.inviter.avatar || ''
        }
      }
    };
  }

  /**
   * 接受邀请
   * @param dto 接受邀请参数
   * @param userId 当前用户ID
   * @returns 旅伴关系信息
   */
  async acceptInvitation(
    dto: AcceptInvitationDto,
    userId: string
  ): Promise<AcceptInvitationResponseDto> {
    // 先验证邀请码
    const validateResult = await this.validateInvitation(
      { invitationCode: dto.invitationCode },
      userId
    );

    if (!validateResult.success) {
      throw new BadRequestException((validateResult as ValidateInvitationErrorResponseDto).error.message);
    }

    // 获取邀请信息
    const partnership = await this.prisma.travelPartnership.findUnique({
      where: { invitationCode: dto.invitationCode },
      include: { inviter: true }
    });

    if (!partnership) {
      throw new NotFoundException('邀请码不存在');
    }

    // 检查是否已经有旅伴关系
    const existingPartnership = await this.prisma.travelPartnership.findFirst({
      where: {
        OR: [
          { inviterId: partnership.inviterId, inviteeId: userId },
          { inviterId: userId, inviteeId: partnership.inviterId }
        ],
        status: 'accepted'
      }
    });

    if (existingPartnership) {
      throw new BadRequestException('你们已经是旅伴了');
    }

    // 更新旅伴关系
    const updatedPartnership = await this.prisma.travelPartnership.update({
      where: { id: partnership.id },
      data: {
        inviteeId: userId,
        status: 'accepted',
        acceptedAt: new Date()
      },
      include: {
        inviter: true,
        invitee: true
      }
    });

    // 给邀请者发送"成为好友"通知
    const invitee = updatedPartnership.invitee;
    if (invitee) {
      await this.notificationService.createNotification({
        userId: partnership.inviterId,
        title: '成为好友',
        content: `${invitee.nickname || '用户'} 已经接受了您的好友邀请,可以双人旅行啦!`,
        type: NotificationType.FRIEND_REQUEST,
        avatar: invitee.avatar || undefined,
      });
      
      // 推送通知
      await this.pushService.pushToAccount(
        partnership.inviterId,
        '成为好友',
        `${invitee.nickname || '用户'} 已经接受了您的好友邀请,可以双人旅行啦!`,
        {
          type: NotificationType.FRIEND_REQUEST,
          partnerId: invitee.id
        }
      );
    }

    return {
      success: true,
      data: {
        partnershipId: updatedPartnership.id,
        partner: {
          id: updatedPartnership.inviter.id,
          nickname: updatedPartnership.inviter.nickname || '旅伴',
          avatar: updatedPartnership.inviter.avatar || ''
        },
        createdAt: updatedPartnership.createdAt.toISOString()
      }
    };
  }

  /**
   * 获取用户的旅伴关系列表
   * @param userId 用户ID
   * @returns 旅伴关系列表
   */
  async getPartnerships(userId: string): Promise<PartnershipsResponseDto> {
    const partnerships = await this.prisma.travelPartnership.findMany({
      where: {
        OR: [
          { inviterId: userId },
          { inviteeId: userId }
        ],
        status: 'accepted'
      },
      include: {
        inviter: true,
        invitee: true,
        travels: {
          where: {
            status: 'active'
          }
        }
      },
      orderBy: {
        acceptedAt: 'desc'
      }
    });

    const partnershipDtos: PartnershipDto[] = partnerships.map(p => {
      // 确定partner是对方
      const partner = p.inviterId === userId ? p.invitee : p.inviter;
      
      return {
        id: p.id,
        partner: {
          id: partner?.id || '',
          nickname: partner?.nickname || '旅伴',
          avatar: partner?.avatar || ''
        },
        status: p.status,
        isActiveTravel: p.travels.length > 0,
        createdAt: p.createdAt.toISOString(),
        acceptedAt: p.acceptedAt?.toISOString(),
        unbindExpiresAt: p.unbindExpiresAt?.toISOString()
      };
    });

    return { partnerships: partnershipDtos };
  }

  /**
   * 解除旅伴关系
   * @param partnershipId 旅伴关系ID
   * @param userId 用户ID
   * @returns 解除请求信息
   */
  async unbindPartnership(
    partnershipId: string,
    userId: string
  ): Promise<UnbindResponseDto> {
    const partnership = await this.prisma.travelPartnership.findUnique({
      where: { id: partnershipId },
      include: {
        travels: {
          where: { status: 'active' }
        }
      }
    });

    if (!partnership) {
      throw new NotFoundException('旅伴关系不存在');
    }

    // 验证权限
    if (partnership.inviterId !== userId && partnership.inviteeId !== userId) {
      throw new BadRequestException('无权限操作此旅伴关系');
    }

    // 检查是否有正在进行的旅行
    if (partnership.travels.length > 0) {
      throw new BadRequestException('有正在进行的旅行，无法解除关系');
    }

    // 检查是否已经有解除请求
    if (partnership.unbindRequestedAt && partnership.unbindExpiresAt) {
      const now = new Date();
      if (partnership.unbindExpiresAt > now) {
        // 24小时内已有解除请求，返回现有请求
        return {
          success: true,
          data: {
            partnershipId: partnership.id,
            expiresAt: partnership.unbindExpiresAt.toISOString()
          }
        };
      }
    }

    // 创建新的解除请求（设置24小时过期时间）
    const unbindExpiresAt = new Date(Date.now() + this.UNBIND_EXPIRY_MS);
    await this.prisma.travelPartnership.update({
      where: { id: partnership.id },
      data: {
        unbindRequestedAt: new Date(),
        unbindExpiresAt
      }
    });

    return {
      success: true,
      data: {
        partnershipId: partnership.id,
        expiresAt: unbindExpiresAt.toISOString()
      }
    };
  }

  /**
   * 取消解除请求
   * @param partnershipId 旅伴关系ID
   * @param userId 用户ID
   * @returns 取消结果
   */
  async cancelUnbind(
    partnershipId: string,
    userId: string
  ): Promise<CancelUnbindResponseDto> {
    const partnership = await this.prisma.travelPartnership.findUnique({
      where: { id: partnershipId }
    });

    if (!partnership) {
      throw new NotFoundException('旅伴关系不存在');
    }

    // 验证权限
    if (partnership.inviterId !== userId && partnership.inviteeId !== userId) {
      throw new BadRequestException('无权限操作此旅伴关系');
    }

    // 取消解除请求
    await this.prisma.travelPartnership.update({
      where: { id: partnership.id },
      data: {
        unbindRequestedAt: null,
        unbindExpiresAt: null
      }
    });

    return { success: true };
  }

  /**
   * 检查并自动解除过期的解除请求
   * @param userId 用户ID
   */
  async checkAndAutoUnbind(userId: string): Promise<void> {
    const now = new Date();
    
    const expiredUnbindRequests = await this.prisma.travelPartnership.findMany({
      where: {
        OR: [
          { inviterId: userId },
          { inviteeId: userId }
        ],
        unbindExpiresAt: {
          lte: now
        }
      }
    });

    if (expiredUnbindRequests.length > 0) {
      // 删除过期的关系
      await this.prisma.travelPartnership.deleteMany({
        where: {
          id: { in: expiredUnbindRequests.map(p => p.id) }
        }
      });
    }
  }

  /**
   * 生成随机邀请码
   * @returns 8位邀请码
   */
  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const random = Date.now();
    let code = '';
    
    for (let i = 0; i < 8; i++) {
      code += chars[(random + i) % chars.length];
    }
    
    // 确保唯一性
    return code;
  }
}
