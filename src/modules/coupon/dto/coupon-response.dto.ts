import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CouponDto {
  @ApiProperty({ description: '优惠券ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '优惠券标题', example: '瑞幸咖啡免费券' })
  title: string;

  @ApiPropertyOptional({ description: '优惠券图片URL', example: 'https://example.com/coupon.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({ description: '优惠券描述' })
  description?: string;

  @ApiProperty({ description: '有效期', example: '2026-10-31T23:59:59.000Z' })
  validUntil: Date;

  @ApiProperty({ description: '优惠券状态', enum: ['unused', 'used', 'expired'], example: 'unused' })
  status: string;

  @ApiPropertyOptional({ description: '使用时间' })
  usedAt?: Date;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class CouponListResponseDto {
  @ApiProperty({ description: '优惠券列表', type: [CouponDto] })
  coupons: CouponDto[];
}

export class UseCouponResponseDto {
  @ApiProperty({ description: '优惠券码', example: 'LUCKIN2024ABC123' })
  couponCode: string;

  @ApiProperty({ description: '优惠券标题', example: '瑞幸咖啡免费券' })
  title: string;

  @ApiPropertyOptional({ description: '优惠券图片URL' })
  imageUrl?: string;
}
