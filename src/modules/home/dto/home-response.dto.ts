import { ApiProperty } from '@nestjs/swagger';

export class CurrentCityDto {
  @ApiProperty({ description: '城市ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '城市名称', example: '成都' })
  name: string;

  @ApiProperty({ description: '城市英文名', example: 'Chengdu' })
  englishName: string;
}

export class CurrentPetDto {
  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '宠物名称', example: '小狐狸' })
  name: string;
}

export class TodayStepsSummaryDto {
  @ApiProperty({ description: '今日步数', example: 3500 })
  steps: number;

  @ApiProperty({ description: '步数目标', example: 4000 })
  goal: number;

  @ApiProperty({ description: '今日卡路里', example: 120 })
  calories: number;
}

export class CompanionSummaryDto {
  @ApiProperty({ description: '旅伴用户ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '旅伴昵称', example: '旅伴昵称' })
  nickname: string;

  @ApiProperty({ description: '旅伴头像', example: 'https://example.com/avatar.jpg' })
  avatar: string;
}

export class HomeSummaryResponseDto {
  @ApiProperty({ description: '当前城市信息', type: CurrentCityDto, required: false })
  currentCity?: CurrentCityDto;

  @ApiProperty({ description: '当前激活的宠物', type: CurrentPetDto, required: false })
  currentPet?: CurrentPetDto;

  @ApiProperty({ description: '今日步数统计', type: TodayStepsSummaryDto })
  todaySteps: TodayStepsSummaryDto;

  @ApiProperty({ description: '旅伴列表', type: [CompanionSummaryDto] })
  companions: CompanionSummaryDto[];

  @ApiProperty({ description: '用户基本信息' })
  user: {
    id: string;
    nickname: string;
    avatar: string;
  };
}
