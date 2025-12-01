import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 宠物完整档案DTO（包含扩展信息）
 */
export class PetProfileDto {
  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '宠物名称', example: '艾迪' })
  name: string;

  @ApiProperty({ description: '宠物英文名', example: 'Eddie' })
  englishName: string;

  @ApiPropertyOptional({ description: '简短描述（用于顶部显示）', example: '爱薅羊毛，也爱犀利点评，每天都会给你一份毒舌版《避雷指南》。' })
  shortDescription?: string;

  @ApiPropertyOptional({ description: '详细描述（用于简介Tab）', example: '爱薅羊毛，也爱犀利点评，每天都会给你一份毒舌版《避雷指南》。唯一的小问题是，偶尔需要担心它被店家拉黑。' })
  longDescription?: string;

  @ApiProperty({ description: '宠物头像URL', example: 'https://example.com/fox.jpg' })
  imageUrl: string;

  @ApiProperty({ description: '性格标签数组', example: ['毒舌', '爱薅羊毛', '机智'], type: [String] })
  personalityTags: string[];

  @ApiProperty({ description: '经典台词数组', example: ['"这味道，不如把我扔进榨汁机。"', '"这杯咖啡卖三十？这不是拿智商当奶泡打吗？"'], type: [String] })
  classicLines: string[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

/**
 * 旅行统计DTO
 */
export class PetStatsDto {
  @ApiProperty({ description: '旅行天数', example: 87 })
  travelDays: number;

  @ApiProperty({ description: '已旅行城市数量', example: 15 })
  visitedCities: number;

  @ApiProperty({ description: '累计步数', example: 50000 })
  totalSteps: number;

  @ApiProperty({ description: '累计旅行里程（公里）', example: 35.0 })
  totalDistance: number;
}

/**
 * 成就DTO
 */
export class AchievementDto {
  @ApiProperty({ description: '成就ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '成就名称', example: '日行万步' })
  name: string;

  @ApiPropertyOptional({ description: '成就描述', example: '一天内行走10000步' })
  description?: string;

  @ApiPropertyOptional({ description: '成就图标URL', example: 'https://example.com/icon.png' })
  iconUrl?: string;

  @ApiProperty({ description: '成就状态', example: 'unlocked', enum: ['locked', 'unlocked', 'in_progress'] })
  status: string;

  @ApiPropertyOptional({ description: '当前进度值', example: 10000 })
  currentProgress?: number;

  @ApiPropertyOptional({ description: '目标值', example: 10000 })
  targetValue?: number;

  @ApiPropertyOptional({ description: '解锁时间', example: '2024-01-01T00:00:00.000Z' })
  unlockedAt?: Date;
}

/**
 * 成就列表响应DTO
 */
export class AchievementListResponseDto {
  @ApiProperty({ description: '成就列表', type: [AchievementDto] })
  achievements: AchievementDto[];
}

/**
 * 梦想DTO
 */
export class DreamDto {
  @ApiProperty({ description: '梦想ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '梦想名称', example: '编写《环球薅羊毛圣经》' })
  name: string;

  @ApiPropertyOptional({ description: '梦想描述', example: '正在为成为世界首席省钱顾问而努力！' })
  description?: string;

  @ApiPropertyOptional({ description: '图标（emoji或URL）', example: '📖' })
  icon?: string;

  @ApiProperty({ description: '当前进度值', example: 12 })
  currentProgress: number;

  @ApiProperty({ description: '目标值', example: 100 })
  targetValue: number;

  @ApiProperty({ description: '进度百分比', example: 0.12 })
  progressPercent: number;

  @ApiProperty({ description: '状态', example: 'in_progress', enum: ['in_progress', 'completed'] })
  status: string;

  @ApiPropertyOptional({ description: '完成时间', example: '2024-01-01T00:00:00.000Z' })
  completedAt?: Date;
}

/**
 * 梦想列表响应DTO
 */
export class DreamListResponseDto {
  @ApiProperty({ description: '梦想列表', type: [DreamDto] })
  dreams: DreamDto[];
}

/**
 * 完整档案响应DTO（包含所有信息）
 */
export class PetCompleteProfileResponseDto {
  @ApiProperty({ description: '宠物信息', type: PetProfileDto })
  pet: PetProfileDto;

  @ApiProperty({ description: '旅行统计', type: PetStatsDto })
  stats: PetStatsDto;

  @ApiProperty({ description: '成就列表', type: AchievementListResponseDto })
  achievements: AchievementListResponseDto;

  @ApiProperty({ description: '梦想列表', type: DreamListResponseDto })
  dreams: DreamListResponseDto;
}
