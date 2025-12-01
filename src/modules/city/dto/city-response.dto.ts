import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContinentDto } from './continent-response.dto';

export class CityDto {
  @ApiProperty({ description: '城市ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '城市名称', example: '成都' })
  name: string;

  @ApiProperty({ description: '城市英文名', example: 'Chengdu' })
  englishName: string;

  @ApiProperty({ description: '所属大洲ID', example: 'uuid-string' })
  continentId: string;

  @ApiProperty({ description: '所属国家', example: 'China' })
  country: string;

  @ApiProperty({ description: '城市图片URL', example: 'https://example.com/chengdu.jpg' })
  imageUrl: string;

  @ApiProperty({ description: '是否已解锁', example: true })
  isUnlocked: boolean;

  @ApiPropertyOptional({ description: '解锁条件', example: '达到1000步' })
  unlockCondition?: string;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: '所属大洲信息', type: ContinentDto })
  continent?: ContinentDto;
}

export class CityListResponseDto {
  @ApiProperty({ description: '城市列表', type: [CityDto] })
  cities: CityDto[];
}

export class UserCityDto {
  @ApiProperty({ description: '关系ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '用户ID', example: 'uuid-string' })
  userId: string;

  @ApiProperty({ description: '城市ID', example: 'uuid-string' })
  cityId: string;

  @ApiProperty({ description: '访问次数', example: 1 })
  visitCount: number;

  @ApiProperty({ description: '总步数', example: 0 })
  totalSteps: number;

  @ApiProperty({ description: '总卡路里', example: 0 })
  totalCalories: number;

  @ApiPropertyOptional({ description: '首次访问时间', example: '2024-01-01T00:00:00.000Z' })
  firstVisitAt?: Date;

  @ApiPropertyOptional({ description: '最后访问时间', example: '2024-01-01T00:00:00.000Z' })
  lastVisitAt?: Date;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ description: '城市信息', type: CityDto })
  city: CityDto;
}

export class UserCityListResponseDto {
  @ApiProperty({ description: '用户城市列表', type: [UserCityDto] })
  cities: UserCityDto[];
}
