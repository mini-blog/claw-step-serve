import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import {
  NotificationDto,
  NotificationListResponseDto,
  MarkAsReadResponseDto,
} from './dto/notification-response.dto';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建通知
   * @param dto 创建通知DTO
   * @returns 创建的通知
   */
  async createNotification(dto: CreateNotificationDto): Promise<NotificationDto> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        content: dto.content,
        type: dto.type,
        avatar: dto.avatar,
        imageUrl: dto.imageUrl,
        actionLink: dto.actionLink,
      },
    });

    return this.mapToDto(notification);
  }

  /**
   * 获取用户的通知列表
   * @param userId 用户ID
   * @param page 页码（从1开始）
   * @param pageSize 每页数量
   * @returns 通知列表
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<NotificationListResponseDto> {
    const skip = (page - 1) * pageSize;

    // 获取通知列表
    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
      this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    return {
      notifications: notifications.map((n) => this.mapToDto(n)),
      unreadCount,
      total,
    };
  }

  /**
   * 标记通知为已读
   * @param userId 用户ID
   * @param notificationId 通知ID
   * @returns 操作结果
   */
  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<MarkAsReadResponseDto> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return {
      success: true,
      message: '标记已读成功',
    };
  }

  /**
   * 标记所有通知为已读
   * @param userId 用户ID
   * @returns 操作结果
   */
  async markAllAsRead(userId: string): Promise<MarkAsReadResponseDto> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      success: true,
      message: '全部标记已读成功',
    };
  }

  /**
   * 获取未读通知数量
   * @param userId 用户ID
   * @returns 未读数量
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * 将 Prisma 模型转换为 DTO
   * @param notification Prisma 通知模型
   * @returns 通知DTO
   */
  private mapToDto(notification: any): NotificationDto {
    return {
      id: notification.id,
      title: notification.title,
      content: notification.content,
      type: notification.type,
      avatar: notification.avatar || undefined,
      imageUrl: notification.imageUrl || undefined,
      actionLink: notification.actionLink || undefined,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}

