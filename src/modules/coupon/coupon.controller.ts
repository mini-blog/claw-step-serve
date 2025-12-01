import {
  Controller,
  Get,
  Post,
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
} from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import {
  CouponListResponseDto,
  UseCouponResponseDto,
} from './dto/coupon-response.dto';
import { UseCouponDto } from './dto/coupon.dto';
import { ApiResult, ErrorResponseDto } from '@app/core/common';

@ApiTags('coupon')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @ApiOperation({
    summary: '获取我的优惠券列表',
    description: '获取当前用户的所有优惠券列表',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(CouponListResponseDto)
  @Get('my')
  async getMyCoupons(
    @Request() request: Request & { user: { id: string } },
  ): Promise<CouponListResponseDto> {
    return await this.couponService.getUserCoupons(request.user.id);
  }

  @ApiOperation({
    summary: '使用优惠券',
    description: '使用优惠券并获取优惠券码（点击使用按钮时调用）',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(UseCouponResponseDto)
  @ApiResponse({ status: 404, description: '优惠券不存在', type: ErrorResponseDto })
  @ApiResponse({ status: 400, description: '优惠券已被使用或已过期', type: ErrorResponseDto })
  @Post('use')
  async useCoupon(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: UseCouponDto,
  ): Promise<UseCouponResponseDto> {
    return await this.couponService.useCoupon(request.user.id, dto.userCouponId);
  }
}
