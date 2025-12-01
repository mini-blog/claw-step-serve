import { ApiProperty } from '@nestjs/swagger';

export class ContinentDto {
  @ApiProperty({ description: '大洲ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '大洲名称', example: '亚洲' })
  name: string;

  @ApiProperty({ description: '大洲英文名', example: 'Asia' })
  englishName: string;

  @ApiProperty({ description: '大洲图片URL', example: 'https://example.com/asia.jpg' })
  imageUrl: string;

  @ApiProperty({ description: '排序', example: 1 })
  order: number;

  @ApiProperty({ description: '大洲状态', example: 'unlocked', enum: ['unlocked', 'locked', 'comingSoon'] })
  status: string;

  @ApiProperty({ description: '已解锁城市数量', example: 4 })
  unlockedCitiesCount: number;

  @ApiProperty({ description: '总城市数量', example: 10 })
  totalCitiesCount: number;
}

export class ContinentListResponseDto {
  @ApiProperty({ description: '大洲列表', type: [ContinentDto] })
  continents: ContinentDto[];
}
