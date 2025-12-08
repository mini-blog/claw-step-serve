import { Controller, Get, Post, Body, Request, Delete, Param, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TravelService } from './travel.service';
import { InvitationService } from './invitation.service';
import { StartTravelDto, SwitchToDualDto, SyncStepsDto } from './dto/travel.dto';
import { ValidateInvitationDto, AcceptInvitationDto, CancelUnbindDto } from './dto/invitation.dto';
import { 
  TravelDto, 
  TravelCompanionsResponseDto,
  TravelStatisticsDto,
  CityTravelStatsListResponseDto
} from './dto/travel-response.dto';
import {
  GenerateInvitationResponseDto,
  ValidateInvitationSuccessResponseDto,
  ValidateInvitationErrorResponseDto,
  AcceptInvitationResponseDto,
  PartnershipsResponseDto,
  UnbindResponseDto,
  CancelUnbindResponseDto
} from './dto/invitation-response.dto';
import { ApiResult, ErrorResponseDto } from '@app/core/common';

@ApiTags('travel')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('travel')
export class TravelController {
  constructor(
    private readonly travelService: TravelService,
    private readonly invitationService: InvitationService
  ) {}

  @ApiOperation({ 
    summary: '获取当前旅行',
    description: '获取用户当前正在进行的旅行信息'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(TravelDto)
  @ApiResponse({ status: 404, description: '没有正在进行的旅行', type: ErrorResponseDto })
  @Get('current')
  async getCurrentTravel(@Request() request: Request & { user: { id: string } }): Promise<TravelDto | null> {
    return await this.travelService.getCurrentTravel(request.user.id);
  }

  @ApiOperation({ 
    summary: '开始旅行',
    description: '开始新的旅行（单人/双人）'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(TravelDto)
  @ApiResponse({ status: 400, description: '请求参数错误或已有正在进行的旅行', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '城市不存在', type: ErrorResponseDto })
  @Post('start')
  async startTravel(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: StartTravelDto
  ): Promise<TravelDto> {
    return await this.travelService.startTravel(request.user.id, dto);
  }

  @ApiOperation({ 
    summary: '单人旅行切换为双人',
    description: '将当前单人旅行切换为双人旅行'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(TravelDto)
  @ApiResponse({ status: 400, description: '请求参数错误或已经是双人旅行', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '没有正在进行的旅行', type: ErrorResponseDto })
  @Post('switch-to-dual')
  async switchToDual(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: SwitchToDualDto
  ): Promise<TravelDto> {
    return await this.travelService.switchToDual(request.user.id, dto);
  }

  @ApiOperation({ 
    summary: '获取当前旅伴列表',
    description: '获取当前旅行中的旅伴信息（仅双人旅行有）'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(TravelCompanionsResponseDto)
  @Get('companions')
  async getCurrentCompanions(@Request() request: Request & { user: { id: string } }): Promise<TravelCompanionsResponseDto> {
    const companions = await this.travelService.getCurrentCompanions(request.user.id);
    return { companions };
  }

  @ApiOperation({ 
    summary: '同步步数',
    description: '从前端设备同步步数到服务器'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(Boolean) // Assuming boolean or success message, change if needed based on service
  @ApiResponse({ status: 200, description: '同步成功' })
  @ApiResponse({ status: 400, description: '请求参数错误或没有正在进行的旅行', type: ErrorResponseDto })
  @Post('sync')
  async syncSteps(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: SyncStepsDto
  ): Promise<any> {
    return await this.travelService.syncSteps(request.user.id, dto);
  }

  @ApiOperation({ 
    summary: '获取旅行统计',
    description: '获取用户的历史旅行统计信息（整体统计：旅行城市数、所有步数、消耗卡路里）'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(TravelStatisticsDto)
  @Get('statistics')
  async getStatistics(@Request() request: Request & { user: { id: string } }): Promise<TravelStatisticsDto> {
    return await this.travelService.getStatistics(request.user.id);
  }

  @ApiOperation({ 
    summary: '获取按城市分组的旅行统计',
    description: '获取用户按城市分组的详细旅行统计信息（每个城市的旅行天数、所有步数、消耗卡路里）'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(CityTravelStatsListResponseDto)
  @Get('statistics/cities')
  async getCityTravelStatistics(@Request() request: Request & { user: { id: string } }): Promise<CityTravelStatsListResponseDto> {
    const cities = await this.travelService.getCityTravelStatistics(request.user.id);
    return { cities };
  }

  // ========== 邀请管理接口 ==========

  @ApiOperation({ 
    summary: '生成邀请码',
    description: '生成一个邀请码，用于邀请其他用户成为旅伴。可选指定好友ID，将自动发送推送通知。'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(GenerateInvitationResponseDto)
  @Post('invitation/generate')
  async generateInvitation(
    @Request() request: Request & { user: { id: string } },
  ): Promise<GenerateInvitationResponseDto> {
    return await this.invitationService.generateInvitation(request.user.id);
  }

  @ApiOperation({ 
    summary: '验证邀请码',
    description: '验证邀请码是否有效，并返回邀请者信息'
  })
  @ApiBearerAuth('JWT-auth')
  // For union types, ApiResult might need specific handling or just documenting the possible successful response types separately if they differ significantly,
  // but here we assume ValidateInvitationSuccessResponseDto is the main success case.
  // Error cases are handled by exceptions/ErrorResponseDto.
  @ApiResult(ValidateInvitationSuccessResponseDto) 
  @ApiResponse({ status: 400, description: '验证失败', type: ErrorResponseDto }) 
  @Post('invitation/validate')
  async validateInvitation(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: ValidateInvitationDto
  ): Promise<ValidateInvitationSuccessResponseDto | ValidateInvitationErrorResponseDto> {
    return await this.invitationService.validateInvitation(dto, request.user.id);
  }

  @ApiOperation({ 
    summary: '接受邀请',
    description: '接受邀请码，建立旅伴关系'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(AcceptInvitationResponseDto)
  @ApiResponse({ status: 400, description: '请求参数错误', type: ErrorResponseDto })
  @Post('invitation/accept')
  async acceptInvitation(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: AcceptInvitationDto
  ): Promise<AcceptInvitationResponseDto> {
    return await this.invitationService.acceptInvitation(dto, request.user.id);
  }

  @ApiOperation({ 
    summary: '获取旅伴关系列表',
    description: '获取用户的所有旅伴关系'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(PartnershipsResponseDto)
  @Get('partnerships')
  async getPartnerships(@Request() request: Request & { user: { id: string } }): Promise<PartnershipsResponseDto> {
    return await this.invitationService.getPartnerships(request.user.id);
  }

  @ApiOperation({ 
    summary: '解除旅伴关系',
    description: '解除旅伴关系（需24小时确认）'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(UnbindResponseDto)
  @ApiResponse({ status: 400, description: '请求参数错误或有正在进行的旅行', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '旅伴关系不存在', type: ErrorResponseDto })
  @Delete('partnerships/:id')
  async unbindPartnership(
    @Request() request: Request & { user: { id: string } },
    @Param('id') id: string
  ): Promise<UnbindResponseDto> {
    return await this.invitationService.unbindPartnership(id, request.user.id);
  }

  @ApiOperation({ 
    summary: '取消解除请求',
    description: '取消解除旅伴关系的请求'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResult(CancelUnbindResponseDto)
  @ApiResponse({ status: 400, description: '请求参数错误', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '旅伴关系不存在', type: ErrorResponseDto })
  @Post('partnerships/cancel-unbind')
  async cancelUnbind(
    @Request() request: Request & { user: { id: string } },
    @Body() dto: CancelUnbindDto
  ): Promise<CancelUnbindResponseDto> {
    return await this.invitationService.cancelUnbind(dto.partnershipId, request.user.id);
  }
}
