import {
  Controller,
  Get,
  Post,
  Put,
  Query,
  Body,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import {
  SubscriptionPlansResponseDto,
  CurrentSubscriptionResponseDto,
  CreateSubscriptionResponseDto,
  VerifyPaymentResponseDto,
  CancelSubscriptionResponseDto,
  SubscriptionHistoryResponseDto,
  AppStatisticsResponseDto,
} from './dto/subscription-response.dto';
import { CreateSubscriptionDto, VerifyPaymentDto } from './dto/subscription.dto';
import { ApiResult, ErrorResponseDto } from '@app/core/common';

@ApiTags('subscription')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiOperation({
    summary: '获取订阅方案列表',
    description: '获取可用的订阅方案（月费/年费）及其价格信息',
  })
  @ApiResult(SubscriptionPlansResponseDto)
  @Get('plans')
  async getSubscriptionPlans(): Promise<SubscriptionPlansResponseDto> {
    return await this.subscriptionService.getSubscriptionPlans();
  }

  @ApiOperation({
    summary: '获取当前用户订阅状态',
    description: '获取用户当前的Pro订阅状态和详细信息',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(CurrentSubscriptionResponseDto)
  @Get('current')
  async getCurrentSubscription(
    @Request() request: Request & { user: { id: string } },
  ): Promise<CurrentSubscriptionResponseDto> {
    return await this.subscriptionService.getCurrentSubscription(request.user.id);
  }

  @ApiOperation({
    summary: '创建订阅',
    description: '创建Pro订阅订单（购买Pro版本）',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(CreateSubscriptionResponseDto)
  @ApiResponse({ status: 400, description: '已有活跃订阅', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '订阅方案不存在', type: ErrorResponseDto })
  @Post('subscribe')
  async createSubscription(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: CreateSubscriptionDto,
  ): Promise<CreateSubscriptionResponseDto> {
    return await this.subscriptionService.createSubscription(request.user.id, dto);
  }

  @ApiOperation({
    summary: '验证支付',
    description: '验证Apple/Google内购支付凭证',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(VerifyPaymentResponseDto)
  @ApiResponse({ status: 400, description: '支付凭证验证失败', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '订阅订单不存在', type: ErrorResponseDto })
  @Post('verify-payment')
  async verifyPayment(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: VerifyPaymentDto,
  ): Promise<VerifyPaymentResponseDto> {
    return await this.subscriptionService.verifyPayment(request.user.id, dto);
  }

  @ApiOperation({
    summary: '取消订阅',
    description: '取消订阅（不会立即失效，到期后不再续费）',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(CancelSubscriptionResponseDto)
  @ApiResponse({ status: 404, description: '没有找到活跃的订阅', type: ErrorResponseDto })
  @Put('cancel')
  async cancelSubscription(
    @Request() request: Request & { user: { id: string } },
  ): Promise<CancelSubscriptionResponseDto> {
    return await this.subscriptionService.cancelSubscription(request.user.id);
  }

  @ApiOperation({
    summary: '恢复订阅',
    description: '恢复已取消的订阅（重新开启自动续费）',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(CancelSubscriptionResponseDto)
  @ApiResponse({ status: 404, description: '没有找到已取消的订阅', type: ErrorResponseDto })
  @Put('restore')
  async restoreSubscription(
    @Request() request: Request & { user: { id: string } },
  ): Promise<CancelSubscriptionResponseDto> {
    return await this.subscriptionService.restoreSubscription(request.user.id);
  }

  @ApiOperation({
    summary: '获取订阅历史',
    description: '获取用户的所有订阅历史记录',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, type: Number })
  @ApiQuery({ name: 'offset', description: '偏移量', required: false, type: Number })
  @ApiResult(SubscriptionHistoryResponseDto)
  @Get('history')
  async getSubscriptionHistory(
    @Request() request: Request & { user: { id: string } },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<SubscriptionHistoryResponseDto> {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return await this.subscriptionService.getSubscriptionHistory(
      request.user.id,
      limitNum,
      offsetNum,
    );
  }

  @ApiOperation({
    summary: '获取应用统计信息',
    description: '获取应用统计信息（用户数、用户评价等）',
  })
  @ApiResult(AppStatisticsResponseDto)
  @Get('statistics')
  async getAppStatistics(): Promise<AppStatisticsResponseDto> {
    return await this.subscriptionService.getAppStatistics();
  }
}
