import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CityVo {
  @ApiProperty({ description: '城市ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '城市名称', example: '成都' })
  name: string;

  @ApiProperty({ description: '城市英文名', example: 'Chengdu' })
  englishName: string;

  @ApiProperty({ description: '城市图片URL', example: 'https://example.com/chengdu.jpg' })
  imageUrl: string;
}

export class PartnerVo {
  @ApiProperty({ description: '旅伴ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '旅伴昵称', example: '小明' })
  nickname: string;

  @ApiProperty({ description: '旅伴头像', example: 'https://example.com/avatar.jpg' })
  avatar: string;
}

export class TravelDto {
  @ApiProperty({ description: '旅行ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '用户ID', example: 'uuid-string' })
  userId: string;

  @ApiProperty({ description: '城市ID', example: 'uuid-string' })
  cityId: string;

  @ApiProperty({ description: '旅行类型', example: 'single', enum: ['single', 'dual'] })
  type: string;

  @ApiProperty({ description: '旅伴ID', example: 'uuid-string', required: false })
  partnerId?: string;

  @ApiProperty({ description: '旅伴关系ID', example: 'uuid-string', required: false })
  partnershipId?: string;

  @ApiProperty({ description: '旅行状态', example: 'active', enum: ['active', 'completed', 'paused'] })
  status: string;

  @ApiProperty({ description: '开始时间', example: '2024-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ description: '结束时间', example: '2024-01-01T00:00:00.000Z', required: false })
  endDate?: Date;

  @ApiProperty({ description: '完成时间', example: '2024-01-01T00:00:00.000Z', required: false })
  completedAt?: Date;

  @ApiProperty({ description: '总步数', example: 5000 })
  totalSteps: number;

  @ApiProperty({ description: '总卡路里', example: 200 })
  totalCalories: number;

  @ApiProperty({ description: '已旅行天数', example: 3 })
  days: number;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  // 关联信息
  @ApiPropertyOptional({ description: '城市信息', type: CityVo })
  city?: CityVo;

  @ApiPropertyOptional({ description: '旅伴信息', type: PartnerVo })
  partner?: PartnerVo;
}

export class TravelCompanionDto {
  @ApiProperty({ description: '旅伴用户ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '旅伴昵称', example: '旅伴昵称' })
  nickname: string;

  @ApiProperty({ description: '旅伴头像', example: 'https://example.com/avatar.jpg' })
  avatar: string;
}

export class TravelCompanionsResponseDto {
  @ApiProperty({ description: '旅伴列表', type: [TravelCompanionDto] })
  companions: TravelCompanionDto[];
}

export class TodayStepsDto {
  @ApiProperty({ description: '今日步数', example: 3500 })
  steps: number;

  @ApiProperty({ description: '步数目标', example: 4000 })
  goal: number;

  @ApiProperty({ description: '今日卡路里', example: 120 })
  calories: number;

  @ApiProperty({ description: '日期', example: '2024-01-01T00:00:00.000Z' })
  date: string;
}

export class TravelStatisticsDto {
  @ApiProperty({ description: '旅行城市数', example: 2 })
  totalCities: number;

  @ApiProperty({ description: '所有步数', example: 43558 })
  totalSteps: number;

  @ApiProperty({ description: '消耗卡路里', example: 5848 })
  totalCalories: number;
}

export class CityTravelStatsDto {
  @ApiProperty({ description: '城市ID', example: 'uuid-string' })
  cityId: string;

  @ApiProperty({ description: '城市名称', example: '成都' })
  cityName: string;

  @ApiProperty({ description: '城市图片URL', example: 'https://example.com/chengdu.jpg' })
  cityImageUrl: string;

  @ApiProperty({ description: '旅行天数', example: 7 })
  travelDays: number;

  @ApiProperty({ description: '所有步数', example: 43456 })
  totalSteps: number;

  @ApiProperty({ description: '消耗卡路里', example: 3453 })
  totalCalories: number;
}

export class CityTravelStatsListResponseDto {
  @ApiProperty({ description: '城市统计列表', type: [CityTravelStatsDto] })
  cities: CityTravelStatsDto[];
}
