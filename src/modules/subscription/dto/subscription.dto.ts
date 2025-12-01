import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

// 创建订阅请求
export class CreateSubscriptionDto {
  @ApiProperty({ 
    description: '订阅方案类型', 
    enum: ['monthly', 'yearly'],
    example: 'yearly'
  })
  @IsEnum(['monthly', 'yearly'])
  planType: 'monthly' | 'yearly';

  @ApiPropertyOptional({ 
    description: '支付方式', 
    enum: ['apple', 'google', 'alipay', 'wechat'],
    example: 'apple'
  })
  @IsOptional()
  @IsEnum(['apple', 'google', 'alipay', 'wechat'])
  paymentMethod?: string;

  @ApiPropertyOptional({ 
    description: '支付凭证（Apple/Google内购）', 
    example: 'receipt_string'
  })
  @IsOptional()
  @IsString()
  receipt?: string;
}

// 验证支付请求
export class VerifyPaymentDto {
  @ApiProperty({ description: '订单ID', example: 'uuid-string' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: '支付凭证', example: 'receipt_string' })
  @IsString()
  receipt: string;

  @ApiProperty({ 
    description: '支付平台', 
    enum: ['apple', 'google'],
    example: 'apple'
  })
  @IsEnum(['apple', 'google'])
  platform: 'apple' | 'google';
}
