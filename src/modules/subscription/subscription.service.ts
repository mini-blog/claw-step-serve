import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import {
  SubscriptionPlansResponseDto,
  SubscriptionPlanDto,
  CurrentSubscriptionResponseDto,
  CreateSubscriptionResponseDto,
  VerifyPaymentResponseDto,
  CancelSubscriptionResponseDto,
  SubscriptionHistoryResponseDto,
  SubscriptionDto,
  AppStatisticsResponseDto,
} from './dto/subscription-response.dto';
import { CreateSubscriptionDto, VerifyPaymentDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取订阅方案列表
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlansResponseDto> {
    // 从数据库获取订阅方案，如果没有则返回默认方案
    let plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // 如果数据库中没有方案，返回默认方案
    if (plans.length === 0) {
      plans = await this.initializeDefaultPlans();
    }

    const planDtos: SubscriptionPlanDto[] = plans.map((plan) => ({
      id: plan.planType,
      planType: plan.planType,
      name: plan.name,
      description: plan.description,
      price: Number(plan.price),
      originalPrice: plan.originalPrice ? Number(plan.originalPrice) : undefined,
      discount: plan.discount || undefined,
      duration: plan.duration,
      currency: plan.currency,
      isActive: plan.isActive,
    }));

    return { plans: planDtos };
  }

  /**
   * 初始化默认订阅方案
   */
  private async initializeDefaultPlans(): Promise<any[]> {
    const defaultPlans = [
      {
        planType: 'monthly',
        name: '连续每月',
        description: '一笔一笔',
        price: 36.0,
        originalPrice: null,
        discount: null,
        duration: 30,
        currency: 'CNY',
        isActive: true,
        order: 1,
      },
      {
        planType: 'yearly',
        name: '连续每年',
        description: '一次聚会',
        price: 288.0,
        originalPrice: 432.0,
        discount: 35,
        duration: 365,
        currency: 'CNY',
        isActive: true,
        order: 0,
      },
    ];

    // 批量创建
    const createdPlans = [];
    for (const plan of defaultPlans) {
      const created = await this.prisma.subscriptionPlan.upsert({
        where: { planType: plan.planType },
        update: plan,
        create: plan,
      });
      createdPlans.push(created);
    }

    return createdPlans;
  }

  /**
   * 获取当前用户订阅状态
   */
  async getCurrentSubscription(userId: string): Promise<CurrentSubscriptionResponseDto> {
    const now = new Date();

    // 查找当前活跃的订阅
    const subscription = await this.prisma.proSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gt: now },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 如果没有活跃订阅，检查是否有已过期但未更新的订阅
    if (!subscription) {
      // 检查是否有已过期但状态仍为 active 的订阅
      const expiredSubscription = await this.prisma.proSubscription.findFirst({
        where: {
          userId,
          status: 'active',
          endDate: { lte: now },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // 如果找到已过期的订阅，更新状态
      if (expiredSubscription) {
        await this.prisma.proSubscription.update({
          where: { id: expiredSubscription.id },
          data: { status: 'expired' },
        });

        // 更新用户的 isPro 状态
        await this.updateUserProStatus(userId);
      }
    }

    // 计算 isPro 状态
    const isPro = subscription !== null;

    if (!subscription) {
      return { isPro: false };
    }

    // 计算剩余天数
    const remainingDays = Math.max(0, Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      isPro,
      subscription: this.mapToSubscriptionDto(subscription, remainingDays),
    };
  }

  /**
   * 创建订阅
   */
  async createSubscription(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<CreateSubscriptionResponseDto> {
    // 获取订阅方案
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { planType: dto.planType },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('订阅方案不存在或已停用');
    }

    // 检查用户是否已有活跃订阅
    const existingSubscription = await this.prisma.proSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gt: new Date() },
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('您已有活跃的订阅，请先取消当前订阅');
    }

    // 计算订阅时间
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    // 创建订阅记录
    const subscription = await this.prisma.proSubscription.create({
      data: {
        userId,
        planType: dto.planType,
        status: dto.receipt ? 'pending' : 'active', // 如果有支付凭证，状态为pending，等待验证
        price: plan.price,
        originalPrice: plan.originalPrice,
        discount: plan.discount,
        paymentMethod: dto.paymentMethod,
        receipt: dto.receipt,
        startDate,
        endDate,
        autoRenew: true,
      },
    });

    // 如果不需要验证支付（直接激活），更新用户 isPro 状态
    if (!dto.receipt) {
      await this.updateUserProStatus(userId);
    }

    // 如果是第三方支付，生成支付链接（这里需要集成实际的支付服务）
    let paymentUrl: string | undefined;
    if (dto.paymentMethod && ['alipay', 'wechat'].includes(dto.paymentMethod) && !dto.receipt) {
      // TODO: 集成支付宝/微信支付，生成支付链接
      // paymentUrl = await this.generatePaymentUrl(subscription.id, dto.paymentMethod, plan.price);
    }

    return {
      orderId: subscription.id,
      subscription: this.mapToSubscriptionDto(subscription),
      paymentUrl,
    };
  }

  /**
   * 验证支付（Apple/Google内购）
   */
  async verifyPayment(
    userId: string,
    dto: VerifyPaymentDto,
  ): Promise<VerifyPaymentResponseDto> {
    const subscription = await this.prisma.proSubscription.findFirst({
      where: {
        id: dto.orderId,
        userId,
        status: 'pending',
      },
    });

    if (!subscription) {
      throw new NotFoundException('订阅订单不存在或已处理');
    }

    // TODO: 验证支付凭证
    // 这里需要集成 Apple IAP 或 Google Play Billing 的验证逻辑
    // const isValid = await this.verifyReceipt(dto.receipt, dto.platform);
    // if (!isValid) {
    //   throw new BadRequestException('支付凭证验证失败');
    // }

    // 模拟验证成功
    const isValid = true;

    if (!isValid) {
      // 更新订阅状态为失败
      await this.prisma.proSubscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
      });
      throw new BadRequestException('支付凭证验证失败');
    }

    // 更新订阅状态为激活
    const updated = await this.prisma.proSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'active',
        receipt: dto.receipt,
        paymentMethod: dto.platform,
      },
    });

    // 更新用户 isPro 状态
    await this.updateUserProStatus(userId);

    return {
      success: true,
      subscription: this.mapToSubscriptionDto(updated),
    };
  }

  /**
   * 取消订阅
   */
  async cancelSubscription(userId: string): Promise<CancelSubscriptionResponseDto> {
    const subscription = await this.prisma.proSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gt: new Date() },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      throw new NotFoundException('没有找到活跃的订阅');
    }

    // 取消自动续费
    const updated = await this.prisma.proSubscription.update({
      where: { id: subscription.id },
      data: {
        autoRenew: false,
        cancelledAt: new Date(),
      },
    });

    // 注意：取消订阅不会立即失效，到期后不再续费
    const now = new Date();
    const remainingDays = Math.max(0, Math.ceil((updated.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      success: true,
      subscription: this.mapToSubscriptionDto(updated, remainingDays),
    };
  }

  /**
   * 恢复订阅
   */
  async restoreSubscription(userId: string): Promise<CancelSubscriptionResponseDto> {
    const subscription = await this.prisma.proSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        cancelledAt: { not: null },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      throw new NotFoundException('没有找到已取消的订阅');
    }

    // 恢复自动续费
    const updated = await this.prisma.proSubscription.update({
      where: { id: subscription.id },
      data: {
        autoRenew: true,
        cancelledAt: null,
      },
    });

    const now = new Date();
    const remainingDays = Math.max(0, Math.ceil((updated.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      success: true,
      subscription: this.mapToSubscriptionDto(updated, remainingDays),
    };
  }

  /**
   * 获取订阅历史
   */
  async getSubscriptionHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<SubscriptionHistoryResponseDto> {
    const [subscriptions, total] = await Promise.all([
      this.prisma.proSubscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.proSubscription.count({
        where: { userId },
      }),
    ]);

    const now = new Date();
    const subscriptionDtos = subscriptions.map((sub) => {
      const remainingDays = sub.status === 'active' && sub.endDate > now
        ? Math.max(0, Math.ceil((sub.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : undefined;
      return this.mapToSubscriptionDto(sub, remainingDays);
    });

    return {
      subscriptions: subscriptionDtos,
      total,
    };
  }

  /**
   * 获取应用统计信息
   */
  async getAppStatistics(): Promise<AppStatisticsResponseDto> {
    // 获取总用户数
    const totalUsers = await this.prisma.user.count();

    // 模拟用户评价数据（实际应该从数据库或配置中获取）
    const reviews = [
      {
        id: '1',
        content: '没想到步数还能换成旅行地图，像在云旅游，每天都期待宠物到下一个城市，每天走路都有了意义，太好玩了！',
        author: '小麦',
        language: 'zh_CN',
      },
      {
        id: '2',
        content: 'Talking with pets is so much fun. Calling a friend cures loneliness.',
        author: 'User',
        language: 'en',
      },
    ];

    return {
      totalUsers,
      reviews,
    };
  }

  /**
   * 更新用户 isPro 状态
   */
  private async updateUserProStatus(userId: string): Promise<void> {
    const now = new Date();
    const activeSubscription = await this.prisma.proSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gt: now },
      },
    });

    const isPro = activeSubscription !== null;

    await this.prisma.user.update({
      where: { id: userId },
      data: { isPro },
    });
  }

  /**
   * 映射订阅数据到DTO
   */
  private mapToSubscriptionDto(subscription: any, remainingDays?: number): SubscriptionDto {
    return {
      id: subscription.id,
      planType: subscription.planType,
      status: subscription.status,
      price: Number(subscription.price),
      originalPrice: subscription.originalPrice ? Number(subscription.originalPrice) : undefined,
      discount: subscription.discount || undefined,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      cancelledAt: subscription.cancelledAt,
      autoRenew: subscription.autoRenew,
      remainingDays,
      createdAt: subscription.createdAt,
    };
  }
}
