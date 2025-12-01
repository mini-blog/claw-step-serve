import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PetDto {
  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '宠物名称', example: '小狐狸' })
  name: string;

  @ApiProperty({ description: '宠物英文名', example: 'Fox' })
  englishName: string;

  @ApiPropertyOptional({ description: '简短描述（用于顶部显示）', example: '爱薅羊毛，也爱犀利点评，每天都会给你一份毒舌版《避雷指南》。' })
  shortDescription?: string;

  @ApiPropertyOptional({ description: '详细描述（用于简介Tab）', example: '爱薅羊毛，也爱犀利点评，每天都会给你一份毒舌版《避雷指南》。唯一的小问题是，偶尔需要担心它被店家拉黑。' })
  longDescription?: string;

  @ApiProperty({ description: '宠物头像URL', example: 'https://example.com/fox.jpg' })
  imageUrl: string;

  @ApiPropertyOptional({ description: '性格标签数组', example: ['毒舌', '爱薅羊毛', '机智'], type: [String] })
  personalityTags?: string[];

  @ApiPropertyOptional({ description: '经典台词数组', example: ['"这味道，不如把我扔进榨汁机。"', '"这杯咖啡卖三十？这不是拿智商当奶泡打吗？"'], type: [String] })
  classicLines?: string[];

  @ApiPropertyOptional({ description: '是否已选中（当 includeSelection=true 时返回）', example: true })
  isSelected?: boolean;
}

export class PetListResponseDto {
  @ApiProperty({ description: '宠物列表', type: [PetDto] })
  pets: PetDto[];

  @ApiPropertyOptional({ description: '当前选中的宠物ID（当 includeSelection=true 时返回）', example: 'uuid-string' })
  currentPetId?: string;
}

export class UserPetDto {
  @ApiProperty({ description: '关系ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '用户ID', example: 'uuid-string' })
  userId: string;

  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  petId: string;

  @ApiProperty({ description: '是否激活', example: true })
  isActive: boolean;

  @ApiProperty({ description: '选择时间', example: '2024-01-01T00:00:00.000Z' })
  selectedAt: Date;

  @ApiProperty({ description: '宠物信息', type: PetDto })
  pet: PetDto;
}

export class UserPetListResponseDto {
  @ApiProperty({ description: '用户宠物列表', type: [UserPetDto] })
  pets: UserPetDto[];
}
