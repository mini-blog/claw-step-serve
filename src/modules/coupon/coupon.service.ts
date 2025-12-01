import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/core/modules/prisma/prisma.service';
import { CouponDto, CouponListResponseDto, UseCouponResponseDto } from './dto/coupon-response.dto';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取用户的优惠券列表
   * @param userId 用户ID
   * @returns 优惠券列表
   */
  async getUserCoupons(userId: string): Promise<CouponListResponseDto> {
    const now = new Date();

    // 获取用户的所有优惠券，包含优惠券模板信息
    const userCoupons = await this.prisma.userCoupon.findMany({
      where: {
        userId,
      },
      include: {
        coupon: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 检查并更新过期状态
    const updatedCoupons = await Promise.all(
      userCoupons.map(async (userCoupon) => {
        // 如果已过期且状态不是已过期，则更新状态
        if (userCoupon.validUntil < now && userCoupon.status !== 'expired' && userCoupon.status !== 'used') {
          await this.prisma.userCoupon.update({
            where: { id: userCoupon.id },
            data: { status: 'expired' },
          });
          return { ...userCoupon, status: 'expired' };
        }
        return userCoupon;
      })
    );

    // 转换为 DTO
    const coupons: CouponDto[] = updatedCoupons.map((userCoupon) => ({
      id: userCoupon.id,
      title: userCoupon.coupon.title,
      imageUrl: userCoupon.coupon.imageUrl || undefined,
      description: userCoupon.coupon.description || undefined,
      validUntil: userCoupon.validUntil,
      status: userCoupon.status,
      usedAt: userCoupon.usedAt || undefined,
      createdAt: userCoupon.createdAt,
    }));

    return { coupons };
  }

  /**
   * 使用优惠券（获取优惠券码）
   * @param userId 用户ID
   * @param userCouponId 用户优惠券ID
   * @returns 优惠券码信息
   */
  async useCoupon(userId: string, userCouponId: string): Promise<UseCouponResponseDto> {
    const userCoupon = await this.prisma.userCoupon.findFirst({
      where: {
        id: userCouponId,
        userId,
      },
      include: {
        coupon: true,
      },
    });

    if (!userCoupon) {
      throw new NotFoundException('优惠券不存在');
    }

    // 检查状态
    if (userCoupon.status === 'used') {
      throw new BadRequestException('优惠券已被使用');
    }

    if (userCoupon.status === 'expired') {
      throw new BadRequestException('优惠券已过期');
    }

    // 检查是否过期
    const now = new Date();
    if (userCoupon.validUntil < now) {
      // 更新为过期状态
      await this.prisma.userCoupon.update({
        where: { id: userCoupon.id },
        data: { status: 'expired' },
      });
      throw new BadRequestException('优惠券已过期');
    }

    // 如果还未使用，更新为已使用状态
    if (userCoupon.status === 'unused') {
      await this.prisma.userCoupon.update({
        where: { id: userCoupon.id },
        data: {
          status: 'used',
          usedAt: now,
        },
      });
    }

    return {
      couponCode: userCoupon.couponCode,
      title: userCoupon.coupon.title,
      imageUrl: userCoupon.coupon.imageUrl || undefined,
    };
  }
}

