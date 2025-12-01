import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TravelType {
  SINGLE = 'single',
  DUAL = 'dual'
}

export enum TravelStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

export class StartTravelDto {
  @IsNotEmpty({ message: '城市ID不能为空' })
  @IsString()
  @ApiProperty({ description: '城市ID', example: 'uuid-string' })
  cityId: string;

  @IsNotEmpty({ message: '旅行类型不能为空' })
  @IsEnum(TravelType)
  @ApiProperty({ description: '旅行类型', enum: TravelType, example: 'single' })
  type: TravelType;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '旅伴ID（双人旅行时必需）', example: 'uuid-string', required: false })
  partnerId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '旅伴关系ID（双人旅行时必需）', example: 'uuid-string', required: false })
  partnershipId?: string;
}

export class SwitchToDualDto {
  @IsNotEmpty({ message: '旅伴ID不能为空' })
  @IsString()
  @ApiProperty({ description: '旅伴ID', example: 'uuid-string' })
  partnerId: string;

  @IsNotEmpty({ message: '旅伴关系ID不能为空' })
  @IsString()
  @ApiProperty({ description: '旅伴关系ID', example: 'uuid-string' })
  partnershipId: string;
}

export class SyncStepsDto {
  @IsNotEmpty({ message: '步数不能为空' })
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: '步数', example: 3500 })
  steps: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: '卡路里', example: 120, required: false })
  calories?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '日期（ISO格式），默认今天', example: '2024-01-01T00:00:00.000Z', required: false })
  date?: string;
}

