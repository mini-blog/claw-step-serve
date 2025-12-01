import { Controller, Get, Param, Query, Request, UseInterceptors, ClassSerializerInterceptor, UseGuards, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PetService } from './pet.service';
import { PetDto, PetListResponseDto, UserPetDto, UserPetListResponseDto } from './dto/pet-response.dto';
import { 
  PetProfileDto, 
  PetStatsDto, 
  AchievementListResponseDto, 
  DreamListResponseDto,
  PetCompleteProfileResponseDto 
} from './dto/pet-profile.dto';
import { OptionalJwtAuthGuard } from '@app/core/common/guards/optional-jwt.guard';
import { ApiResult, ErrorResponseDto } from '@app/core/common';

@ApiTags('pet')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('pet')
export class PetController {
  constructor(
    private readonly petService: PetService
  ) {}

  @ApiOperation({ 
    summary: '获取所有宠物列表',
    description: '获取系统中所有可用的宠物列表。当 includeSelection=true 时，需要JWT认证，返回选中状态'
  })
  @ApiQuery({ 
    name: 'includeSelection', 
    required: false, 
    type: Boolean,
    description: '是否包含选中状态（需要JWT认证）',
    example: false
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(PetListResponseDto)
  @ApiResponse({ status: 401, description: '获取选中状态需要JWT认证', type: ErrorResponseDto })
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getAllPets(
    @Query('includeSelection') includeSelection?: string,
    @Request() request?: Request & { user?: { id: string } }
  ): Promise<PetListResponseDto> {
    const shouldIncludeSelection = includeSelection === 'true' || includeSelection === '1';
    const userId = request?.user?.id;
    
    // 如果需要选中状态但没有用户信息，则返回错误提示
    if (shouldIncludeSelection && !userId) {
      throw new UnauthorizedException('系统错误，请稍后重试');
    }

    // 获取宠物列表
    const pets = await this.petService.getAllPets(userId, shouldIncludeSelection);

    return { pets };
  }

  @ApiOperation({ 
    summary: '获取用户当前激活的宠物',
    description: '获取当前用户正在使用的宠物'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(UserPetDto)
  @ApiResponse({ status: 404, description: '用户未选择宠物', type: ErrorResponseDto })
  @Get('user/active')
  async getUserActivePet(@Request() request: Request & { user: { id: string } }): Promise<UserPetDto | null> {
    return await this.petService.getUserActivePet(request.user.id);
  }

  @ApiOperation({ 
    summary: '获取用户的所有宠物',
    description: '获取用户选择过的所有宠物列表'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(UserPetListResponseDto)
  @Get('user/all')
  async getUserPets(@Request() request: Request & { user: { id: string } }): Promise<UserPetListResponseDto> {
    const pets = await this.petService.getUserPets(request.user.id);
    return { pets };
  }

  @ApiOperation({ 
    summary: '获取宠物完整档案（推荐）',
    description: '一次性获取当前激活宠物的完整档案信息（包含简介、统计、成就、梦想）'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(PetCompleteProfileResponseDto)
  @ApiResponse({ status: 404, description: '用户未选择宠物', type: ErrorResponseDto })
  @Get('profile/complete')
  async getCompleteProfile(
    @Request() request: Request & { user: { id: string } }
  ): Promise<PetCompleteProfileResponseDto> {
    // 先获取当前激活的宠物
    const activePet = await this.petService.getUserActivePet(request.user.id);
    if (!activePet) {
      throw new NotFoundException('用户未选择宠物');
    }
    
    return await this.petService.getCompleteProfile(request.user.id, activePet.petId);
  }

  @ApiOperation({ 
    summary: '获取宠物完整档案',
    description: '获取宠物的完整档案信息（包含扩展字段：简短描述、详细描述、性格标签、经典台词）'
  })
  @ApiResult(PetProfileDto)
  @ApiResponse({ status: 404, description: '宠物不存在', type: ErrorResponseDto })
  @Get(':id/profile')
  async getPetProfile(@Param('id') id: string): Promise<PetProfileDto> {
    return await this.petService.getPetProfile(id);
  }

  @ApiOperation({ 
    summary: '获取宠物旅行统计',
    description: '获取基于当前激活宠物的旅行统计数据（旅行天数、已旅行城市、累计步数、累计里程）'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(PetStatsDto)
  @ApiResponse({ status: 404, description: '用户未拥有该宠物', type: ErrorResponseDto })
  @Get(':id/stats')
  async getPetStats(
    @Param('id') petId: string,
    @Request() request: Request & { user: { id: string } }
  ): Promise<PetStatsDto> {
    return await this.petService.getPetStats(request.user.id, petId);
  }

  @ApiOperation({ 
    summary: '获取成就列表',
    description: '获取成就列表（包含用户进度和状态）'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(AchievementListResponseDto)
  @ApiResponse({ status: 404, description: '用户未拥有该宠物', type: ErrorResponseDto })
  @Get(':id/achievements')
  async getAchievements(
    @Param('id') petId: string,
    @Request() request: Request & { user: { id: string } }
  ): Promise<AchievementListResponseDto> {
    const achievements = await this.petService.getAchievements(request.user.id, petId);
    return { achievements };
  }

  @ApiOperation({ 
    summary: '获取梦想进度列表',
    description: '获取梦想进度列表（包含当前进度和完成状态）'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(DreamListResponseDto)
  @ApiResponse({ status: 404, description: '用户未拥有该宠物', type: ErrorResponseDto })
  @Get(':id/dreams')
  async getDreams(
    @Param('id') petId: string,
    @Request() request: Request & { user: { id: string } }
  ): Promise<DreamListResponseDto> {
    const dreams = await this.petService.getDreams(request.user.id, petId);
    return { dreams };
  }

  @ApiOperation({ 
    summary: '获取宠物详情',
    description: '根据ID获取宠物详细信息'
  })
  @ApiResult(PetDto)
  @ApiResponse({ status: 404, description: '宠物不存在', type: ErrorResponseDto })
  @Get(':id')
  async getPetById(@Param('id') id: string): Promise<PetDto> {
    return await this.petService.getPetById(id);
  }
}
