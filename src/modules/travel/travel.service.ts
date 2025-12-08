import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { StartTravelDto, SwitchToDualDto, SyncStepsDto } from './dto/travel.dto';
import { TravelDto, TravelCompanionDto, TodayStepsDto, TravelStatisticsDto, CityTravelStatsDto } from './dto/travel-response.dto';
import { NotificationService } from '../notification/notification.service';
import { PushService } from '../notification/push/push.service';
import { NotificationType } from '../notification/dto/notification.dto';

@Injectable()
export class TravelService {
  // 7天的毫秒数
  private readonly TRAVEL_DURATION_DAYS = 7;
  private readonly TRAVEL_DURATION_MS = this.TRAVEL_DURATION_DAYS * 24 * 60 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    private readonly pushService: PushService
  ) {}

  /**
   * 检查并自动完成过期的旅行
   * @param userId 用户ID
   */
  async checkAndCompleteExpiredTravels(userId: string): Promise<void> {
    const now = new Date();
    
    // 查找所有active状态的旅行，且已超过7天
    const expiredTravels = await this.prisma.travel.findMany({
      where: {
        userId,
        status: 'active',
        startDate: {
          lt: new Date(now.getTime() - this.TRAVEL_DURATION_MS)
        }
      }
    });

    // 批量更新为completed状态
    if (expiredTravels.length > 0) {
      await this.prisma.travel.updateMany({
        where: {
          id: { in: expiredTravels.map(t => t.id) }
        },
        data: {
          status: 'completed',
          endDate: now,
          completedAt: now
        }
      });
    }
  }

  /**
   * 获取当前旅行
   * @param userId 用户ID
   * @returns 当前旅行信息
   */
  async getCurrentTravel(userId: string): Promise<TravelDto | null> {
    // 先检查并自动完成过期的旅行
    await this.checkAndCompleteExpiredTravels(userId);

    const travel = await this.prisma.travel.findFirst({
      where: {
        userId,
        status: 'active'
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            englishName: true,
            imageUrl: true
          }
        }
      }
    });

    if (!travel) {
      return null;
    }

    // 如果有旅伴，获取旅伴信息
    let partner = null;
    if (travel.partnerId) {
      const partnerUser = await this.prisma.user.findUnique({
        where: { id: travel.partnerId },
        select: {
          id: true,
          nickname: true,
          avatar: true
        }
      });
      if (partnerUser) {
        partner = {
          id: partnerUser.id,
          nickname: partnerUser.nickname || '旅伴',
          avatar: partnerUser.avatar || ''
        };
      }
    }

    return {
      id: travel.id,
      userId: travel.userId,
      cityId: travel.cityId,
      type: travel.type,
      partnerId: travel.partnerId || undefined,
      partnershipId: travel.partnershipId || undefined,
      status: travel.status,
      startDate: travel.startDate,
      endDate: travel.endDate || undefined,
      completedAt: travel.completedAt || undefined,
      totalSteps: travel.totalSteps,
      totalCalories: travel.totalCalories,
      days: travel.days,
      createdAt: travel.createdAt,
      updatedAt: travel.updatedAt,
      city: {
        id: travel.city.id,
        name: travel.city.name,
        englishName: travel.city.englishName,
        imageUrl: travel.city.imageUrl
      },
      partner: partner || undefined
    };
  }

  /**
   * 开始旅行
   * @param userId 用户ID
   * @param dto 旅行参数
   * @returns 创建的旅行信息
   */
  async startTravel(userId: string, dto: StartTravelDto): Promise<TravelDto> {
    // 先检查并自动完成过期的旅行
    await this.checkAndCompleteExpiredTravels(userId);

    // 检查是否已经有active的旅行
    const existingTravel = await this.prisma.travel.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });

    if (existingTravel) {
      throw new BadRequestException('你已经在旅行中，请先完成或暂停当前旅行');
    }

    // 验证城市是否存在
    const city = await this.prisma.city.findUnique({
      where: { id: dto.cityId }
    });

    if (!city) {
      throw new NotFoundException('城市不存在');
    }

    // 如果是双人旅行，验证旅伴信息
    if (dto.type === 'dual') {
      if (!dto.partnerId || !dto.partnershipId) {
        throw new BadRequestException('双人旅行需要指定旅伴和旅伴关系');
      }

      // 验证旅伴关系是否有效
      const partnership = await this.prisma.travelPartnership.findUnique({
        where: { id: dto.partnershipId }
      });

      if (!partnership || partnership.status !== 'accepted') {
        throw new BadRequestException('旅伴关系无效或未接受');
      }

      // 验证partnerId是否匹配
      if (partnership.inviterId !== userId && partnership.inviteeId !== userId) {
        throw new BadRequestException('无效的旅伴关系');
      }

      const actualPartnerId = partnership.inviterId === userId ? partnership.inviteeId : partnership.inviterId;
      if (actualPartnerId !== dto.partnerId) {
        throw new BadRequestException('旅伴信息不匹配');
      }
    }

    // 创建旅行记录
    const travel = await this.prisma.travel.create({
      data: {
        userId,
        cityId: dto.cityId,
        type: dto.type,
        partnerId: dto.partnerId,
        partnershipId: dto.partnershipId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + this.TRAVEL_DURATION_MS), // 7天后
        totalSteps: 0,
        totalCalories: 0,
        days: 0
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            englishName: true,
            imageUrl: true
          }
        }
      }
    });

    // 获取旅伴信息
    let partner = null;
    if (travel.partnerId) {
      const partnerUser = await this.prisma.user.findUnique({
        where: { id: travel.partnerId },
        select: {
          id: true,
          nickname: true,
          avatar: true
        }
      });
      if (partnerUser) {
        partner = {
          id: partnerUser.id,
          nickname: partnerUser.nickname || '旅伴',
          avatar: partnerUser.avatar || ''
        };
      }

      // ⚠️ 核心修改：自动向旅伴发送通知和推送
      // 获取当前用户信息
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { nickname: true }
      });
      
      const currentUserName = currentUser?.nickname || '您的好友';
      const title = '双人旅行邀请';
      const content = `${currentUserName} 邀请您一起开启前往 ${travel.city.name} 的旅行！`;

      // 1. 站内通知
      await this.notificationService.createNotification({
        userId: travel.partnerId,
        title,
        content,
        type: NotificationType.TRAVEL_INVITATION,
        actionLink: `clawstep://travel/details?id=${travel.id}`, // Deep link
      });

      // 2. 推送通知
      await this.pushService.pushToAccount(
        travel.partnerId,
        title,
        content,
        {
          type: NotificationType.TRAVEL_INVITATION,
          travelId: travel.id,
          inviterId: userId,
          inviterName: currentUserName,
          cityId: travel.cityId,
          cityName: travel.city.name,
          partnershipId: dto.partnershipId,
        }
      );
    }

    return {
      id: travel.id,
      userId: travel.userId,
      cityId: travel.cityId,
      type: travel.type,
      partnerId: travel.partnerId || undefined,
      partnershipId: travel.partnershipId || undefined,
      status: travel.status,
      startDate: travel.startDate,
      endDate: travel.endDate || undefined,
      completedAt: travel.completedAt || undefined,
      totalSteps: travel.totalSteps,
      totalCalories: travel.totalCalories,
      days: travel.days,
      createdAt: travel.createdAt,
      updatedAt: travel.updatedAt,
      city: {
        id: travel.city.id,
        name: travel.city.name,
        englishName: travel.city.englishName,
        imageUrl: travel.city.imageUrl
      },
      partner: partner || undefined
    };
  }

  /**
   * 单人旅行切换为双人旅行
   * @param userId 用户ID
   * @param dto 切换参数
   * @returns 更新后的旅行信息
   */
  async switchToDual(userId: string, dto: SwitchToDualDto): Promise<TravelDto> {
    // 先检查并自动完成过期的旅行
    await this.checkAndCompleteExpiredTravels(userId);

    // 查找当前active的旅行
    const travel = await this.prisma.travel.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });

    if (!travel) {
      throw new NotFoundException('当前没有正在进行的旅行');
    }

    if (travel.type === 'dual') {
      throw new BadRequestException('当前已经是双人旅行');
    }

    // 验证旅伴关系
    const partnership = await this.prisma.travelPartnership.findUnique({
      where: { id: dto.partnershipId }
    });

    if (!partnership || partnership.status !== 'accepted') {
      throw new BadRequestException('旅伴关系无效或未接受');
    }

    // 验证partnerId
    const actualPartnerId = partnership.inviterId === userId ? partnership.inviteeId : partnership.inviterId;
    if (actualPartnerId !== dto.partnerId) {
      throw new BadRequestException('旅伴信息不匹配');
    }

    // 更新旅行为双人
    const updatedTravel = await this.prisma.travel.update({
      where: { id: travel.id },
      data: {
        type: 'dual',
        partnerId: dto.partnerId,
        partnershipId: dto.partnershipId
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            englishName: true,
            imageUrl: true
          }
        }
      }
    });

    // 获取旅伴信息
    const partnerUser = await this.prisma.user.findUnique({
      where: { id: dto.partnerId },
      select: {
        id: true,
        nickname: true,
        avatar: true
      }
    });

    const partner = partnerUser ? {
      id: partnerUser.id,
      nickname: partnerUser.nickname || '旅伴',
      avatar: partnerUser.avatar || ''
    } : null;

    return {
      id: updatedTravel.id,
      userId: updatedTravel.userId,
      cityId: updatedTravel.cityId,
      type: updatedTravel.type,
      partnerId: updatedTravel.partnerId || undefined,
      partnershipId: updatedTravel.partnershipId || undefined,
      status: updatedTravel.status,
      startDate: updatedTravel.startDate,
      endDate: updatedTravel.endDate || undefined,
      completedAt: updatedTravel.completedAt || undefined,
      totalSteps: updatedTravel.totalSteps,
      totalCalories: updatedTravel.totalCalories,
      days: updatedTravel.days,
      createdAt: updatedTravel.createdAt,
      updatedAt: updatedTravel.updatedAt,
      city: {
        id: updatedTravel.city.id,
        name: updatedTravel.city.name,
        englishName: updatedTravel.city.englishName,
        imageUrl: updatedTravel.city.imageUrl
      },
      partner: partner || undefined
    };
  }

  /**
   * 获取当前旅伴列表
   * @param userId 用户ID
   * @returns 旅伴列表
   */
  async getCurrentCompanions(userId: string): Promise<TravelCompanionDto[]> {
    // 先检查并自动完成过期的旅行
    await this.checkAndCompleteExpiredTravels(userId);

    // 查找当前active的旅行
    const travel = await this.prisma.travel.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });

    if (!travel || travel.type !== 'dual' || !travel.partnerId) {
      return [];
    }

    // 获取旅伴信息
    const partner = await this.prisma.user.findUnique({
      where: { id: travel.partnerId },
      select: {
        id: true,
        nickname: true,
        avatar: true
      }
    });

    if (!partner) {
      return [];
    }

    return [{
      id: partner.id,
      nickname: partner.nickname || '旅伴',
      avatar: partner.avatar || ''
    }];
  }

  /**
   * 获取今日步数
   * @param userId 用户ID
   * @returns 今日步数统计
   */
  async getTodaySteps(userId: string): Promise<TodayStepsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查找当前active的旅行
    const travel = await this.prisma.travel.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });

    if (!travel) {
      // 没有active旅行，返回默认值
      return {
        steps: 0,
        goal: 4000,
        calories: 0,
        date: today.toISOString()
      };
    }

    // 查找今日步数记录
    const stepRecord = await this.prisma.stepRecord.findUnique({
      where: {
        userId_cityId_date: {
          userId,
          cityId: travel.cityId,
          date: today
        }
      }
    });

    return {
      steps: stepRecord?.steps || 0,
      goal: 4000, // 默认目标
      calories: stepRecord?.calories || 0,
      date: today.toISOString()
    };
  }

  /**
   * 同步步数
   * @param userId 用户ID
   * @param dto 步数数据
   * @returns 同步结果
   */
  async syncSteps(userId: string, dto: SyncStepsDto): Promise<any> {
    // 查找当前active的旅行
    const travel = await this.prisma.travel.findFirst({
      where: {
        userId,
        status: 'active'
      }
    });

    if (!travel) {
      throw new BadRequestException('当前没有正在进行的旅行');
    }

    // 解析日期
    const targetDate = dto.date ? new Date(dto.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // 计算卡路里（如果没有提供）
    const calories = dto.calories || Math.round(dto.steps * 0.034); // 简单计算：每步约0.034卡路里

    // 使用upsert创建或更新步数记录
    const stepRecord = await this.prisma.stepRecord.upsert({
      where: {
        userId_cityId_date: {
          userId,
          cityId: travel.cityId,
          date: targetDate
        }
      },
      update: {
        steps: dto.steps,
        calories: calories
      },
      create: {
        userId,
        cityId: travel.cityId,
        steps: dto.steps,
        calories: calories,
        date: targetDate
      }
    });

    // 如果是今天的记录，更新旅行统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (targetDate.getTime() === today.getTime()) {
      // 计算总步数和总卡路里（当前旅行期间所有日期）
      const allRecords = await this.prisma.stepRecord.findMany({
        where: {
          userId,
          cityId: travel.cityId,
          date: {
            gte: travel.startDate
          }
        }
      });

      const totalSteps = allRecords.reduce((sum, record) => sum + record.steps, 0);
      const totalCalories = allRecords.reduce((sum, record) => sum + record.calories, 0);

      // 更新旅行统计
      await this.prisma.travel.update({
        where: { id: travel.id },
        data: {
          totalSteps,
          totalCalories
        }
      });

      // 更新UserCity统计
      await this.prisma.userCity.updateMany({
        where: {
          userId,
          cityId: travel.cityId
        },
        data: {
          totalSteps,
          totalCalories
        }
      });
    }

    return {
      success: true,
      data: stepRecord
    };
  }

  /**
   * 获取旅行统计
   * @param userId 用户ID
   * @returns 旅行统计信息
   */
  async getStatistics(userId: string): Promise<TravelStatisticsDto> {
    // 获取所有completed状态的旅行
    const completedTravels = await this.prisma.travel.findMany({
      where: {
        userId,
        status: 'completed'
      }
    });

    const totalSteps = completedTravels.reduce((sum, travel) => sum + travel.totalSteps, 0);
    const totalCalories = completedTravels.reduce((sum, travel) => sum + travel.totalCalories, 0);

    // 获取去过的城市数量
    const totalCities = await this.prisma.userCity.count({
      where: { userId }
    });

    return {
      totalCities,
      totalSteps,
      totalCalories
    };
  }

  /**
   * 获取按城市分组的旅行统计
   * @param userId 用户ID
   * @returns 城市旅行统计列表
   */
  async getCityTravelStatistics(userId: string): Promise<CityTravelStatsDto[]> {
    // 获取所有completed状态的旅行，包含城市信息
    const completedTravels = await this.prisma.travel.findMany({
      where: {
        userId,
        status: 'completed'
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      }
    });

    // 按城市ID分组统计
    const cityStatsMap = new Map<string, {
      cityId: string;
      cityName: string;
      cityImageUrl: string;
      travelDays: number;
      totalSteps: number;
      totalCalories: number;
    }>();

    completedTravels.forEach(travel => {
      const cityId = travel.cityId;
      const existing = cityStatsMap.get(cityId);

      if (existing) {
        existing.travelDays += travel.days;
        existing.totalSteps += travel.totalSteps;
        existing.totalCalories += travel.totalCalories;
      } else {
        cityStatsMap.set(cityId, {
          cityId: travel.city.id,
          cityName: travel.city.name,
          cityImageUrl: travel.city.imageUrl,
          travelDays: travel.days,
          totalSteps: travel.totalSteps,
          totalCalories: travel.totalCalories
        });
      }
    });

    // 转换为数组并返回
    return Array.from(cityStatsMap.values());
  }
}
