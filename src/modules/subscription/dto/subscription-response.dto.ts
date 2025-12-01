import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 订阅方案DTO
export class SubscriptionPlanDto {
  @ApiProperty({ description: '方案ID', example: 'monthly' })
  id: string;

  @ApiProperty({ description: '方案类型', enum: ['monthly', 'yearly'], example: 'monthly' })
  planType: string;

  @ApiProperty({ description: '方案名称', example: '连续每月' })
  name: string;

  @ApiProperty({ description: '方案描述', example: '一笔一笔' })
  description: string;

  @ApiProperty({ description: '价格', example: 36.00 })
  price: number;

  @ApiPropertyOptional({ description: '原价', example: 432.00 })
  originalPrice?: number;

  @ApiPropertyOptional({ description: '折扣百分比', example: 35 })
  discount?: number;

  @ApiProperty({ description: '订阅时长（天数）', example: 30 })
  duration: number;

  @ApiProperty({ description: '货币', example: 'CNY' })
  currency: string;

  @ApiProperty({ description: '是否激活', example: true })
  isActive: boolean;
}

// 订阅方案列表响应
export class SubscriptionPlansResponseDto {
  @ApiProperty({ description: '订阅方案列表', type: [SubscriptionPlanDto] })
  plans: SubscriptionPlanDto[];
}

// 订阅信息DTO
export class SubscriptionDto {
  @ApiProperty({ description: '订阅ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '方案类型', enum: ['monthly', 'yearly'], example: 'yearly' })
  planType: string;

  @ApiProperty({ description: '订阅状态', enum: ['active', 'expired', 'cancelled', 'pending'], example: 'active' })
  status: string;

  @ApiProperty({ description: '价格', example: 288.00 })
  price: number;

  @ApiPropertyOptional({ description: '原价', example: 432.00 })
  originalPrice?: number;

  @ApiPropertyOptional({ description: '折扣百分比', example: 35 })
  discount?: number;

  @ApiProperty({ description: '开始时间' })
  startDate: Date;

  @ApiProperty({ description: '结束时间' })
  endDate: Date;

  @ApiPropertyOptional({ description: '取消时间' })
  cancelledAt?: Date;

  @ApiProperty({ description: '是否自动续费', example: true })
  autoRenew: boolean;

  @ApiPropertyOptional({ description: '剩余天数', example: 30 })
  remainingDays?: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

// 当前订阅状态响应
export class CurrentSubscriptionResponseDto {
  @ApiProperty({ description: '是否为Pro用户', example: true })
  isPro: boolean;

  @ApiPropertyOptional({ description: '订阅信息', type: SubscriptionDto })
  subscription?: SubscriptionDto;
}

// 创建订阅响应
export class CreateSubscriptionResponseDto {
  @ApiProperty({ description: '订单ID', example: 'uuid-string' })
  orderId: string;

  @ApiProperty({ description: '订阅信息', type: SubscriptionDto })
  subscription: SubscriptionDto;

  @ApiPropertyOptional({ description: '支付链接（第三方支付）' })
  paymentUrl?: string;
}

// 验证支付响应
export class VerifyPaymentResponseDto {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '订阅信息', type: SubscriptionDto })
  subscription: SubscriptionDto;
}

// 取消订阅响应
export class CancelSubscriptionResponseDto {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '订阅信息', type: SubscriptionDto })
  subscription: SubscriptionDto;
}

// 订阅历史响应
export class SubscriptionHistoryResponseDto {
  @ApiProperty({ description: '订阅列表', type: [SubscriptionDto] })
  subscriptions: SubscriptionDto[];

  @ApiProperty({ description: '总数量', example: 10 })
  total: number;
}

// 应用统计响应
export class AppStatisticsResponseDto {
  @ApiProperty({ description: '总用户数', example: 200000 })
  totalUsers: number;

  @ApiProperty({ description: '用户评价列表', type: [Object] })
  reviews: Array<{
    id: string;
    content: string;
    author: string;
    language: string;
  }>;
}
