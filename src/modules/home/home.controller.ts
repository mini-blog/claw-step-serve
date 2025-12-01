import { Controller, Get, Request, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { HomeSummaryResponseDto } from './dto/home-response.dto';
import { ApiResult } from '@app/core/common';

@ApiTags('home')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('home')
export class HomeController {
  constructor(
    private readonly homeService: HomeService
  ) {}

  @ApiOperation({ 
    summary: '获取主页聚合信息',
    description: '获取主页显示所需的所有信息（当前城市、宠物、步数、旅伴等）'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(HomeSummaryResponseDto)
  @Get('summary')
  async getHomeSummary(@Request() request: Request & { user: { id: string } }): Promise<HomeSummaryResponseDto> {
    return await this.homeService.getHomeSummary(request.user.id);
  }
}
