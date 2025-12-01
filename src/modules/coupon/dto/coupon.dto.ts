import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UseCouponDto {
  @ApiProperty({ description: '用户优惠券ID', example: 'uuid-string' })
  @IsNotEmpty()
  @IsString()
  userCouponId: string;
}

