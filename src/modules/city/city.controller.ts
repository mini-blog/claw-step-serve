import { Controller, Get, Param, Query, Request, Post, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CityService } from './city.service';
import { CityDto, CityListResponseDto, UserCityDto, UserCityListResponseDto } from './dto/city-response.dto';
import { ContinentListResponseDto } from './dto/continent-response.dto';
import { ApiResult, ErrorResponseDto } from '@app/core/common';

@ApiTags('city')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('city')
export class CityController {
  constructor(
    private readonly cityService: CityService
  ) {}

  @ApiOperation({ 
    summary: '获取所有城市列表',
    description: '获取系统中所有可用的城市列表，支持按大洲和解锁状态筛选'
  })
  @ApiQuery({ name: 'continentId', required: false, description: '大洲ID筛选' })
  @ApiQuery({ name: 'isUnlocked', required: false, type: Boolean, description: '是否解锁筛选' })
  @ApiResult(CityListResponseDto)
  @Get()
  async getAllCities(
    @Query('continentId') continentId?: string,
    @Query('isUnlocked') isUnlocked?: string
  ): Promise<CityListResponseDto> {
    const isUnlockedBool = isUnlocked === 'true' ? true : isUnlocked === 'false' ? false : undefined;
    const cities = await this.cityService.getAllCities(continentId, isUnlockedBool);
    return { cities };
  }

  @ApiOperation({ 
    summary: '获取用户当前访问的城市',
    description: '获取当前用户最近访问的城市'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(UserCityDto)
  @ApiResponse({ status: 404, description: '用户未访问过城市', type: ErrorResponseDto })
  @Get('user/current')
  async getUserCurrentCity(@Request() request: Request & { user: { id: string } }): Promise<UserCityDto | null> {
    return await this.cityService.getUserCurrentCity(request.user.id);
  }

  @ApiOperation({ 
    summary: '获取用户的所有城市',
    description: '获取用户访问过的所有城市列表'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(UserCityListResponseDto)
  @Get('user/all')
  async getUserCities(@Request() request: Request & { user: { id: string } }): Promise<UserCityListResponseDto> {
    const cities = await this.cityService.getUserCities(request.user.id);
    return { cities };
  }

  // ========== 大洲管理接口 ==========

  @ApiOperation({ 
    summary: '获取所有大洲',
    description: '获取所有大洲及其解锁状态'
  })
  @ApiResult(ContinentListResponseDto)
  @Get('continent/list')
  async getAllContinents(): Promise<ContinentListResponseDto> {
    const continents = await this.cityService.getAllContinents();
    return { continents };
  }

  @ApiOperation({ 
    summary: '获取城市详情',
    description: '根据ID获取城市详细信息'
  })
  @ApiResult(CityDto)
  @ApiResponse({ status: 404, description: '城市不存在', type: ErrorResponseDto })
  @Get(':id')
  async getCityById(@Param('id') id: string): Promise<CityDto> {
    return await this.cityService.getCityById(id);
  }

  @ApiOperation({ 
    summary: '解锁城市',
    description: '使用旅行券解锁城市'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(Boolean) // 或者返回具体的解锁结果对象
  @ApiResponse({ status: 200, description: '解锁成功' })
  @ApiResponse({ status: 400, description: '旅行券不足或城市已解锁', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '城市不存在', type: ErrorResponseDto })
  @Post(':id/unlock')
  async unlockCity(@Request() request: Request & { user: { id: string } }, @Param('id') id: string): Promise<any> {
    return await this.cityService.unlockCity(id, request.user.id);
  }
}
