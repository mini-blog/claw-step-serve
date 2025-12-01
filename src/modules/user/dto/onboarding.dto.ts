import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OnboardingCompleteDto {
  @IsNotEmpty({ message: '宠物ID不能为空' })
  @IsString()
  @ApiProperty({ description: '选择的宠物ID', example: 'uuid-string' })
  petId: string;

  @IsNotEmpty({ message: '城市ID不能为空' })
  @IsString()
  @ApiProperty({ description: '选择的城市ID', example: 'uuid-string' })
  cityId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '用户昵称', example: '小明', required: false })
  nickname?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: '初始步数', example: 0, required: false, default: 0 })
  initialSteps?: number;
}

export class SwitchPetDto {
  @IsNotEmpty({ message: '宠物ID不能为空' })
  @IsString()
  @ApiProperty({ description: '要切换的宠物ID', example: 'uuid-string' })
  petId: string;
}

export class SwitchCityDto {
  @IsNotEmpty({ message: '城市ID不能为空' })
  @IsString()
  @ApiProperty({ description: '要切换的城市ID', example: 'uuid-string' })
  cityId: string;
}

