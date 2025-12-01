import { Body, ClassSerializerInterceptor, Controller, Get, Post, Put, Request, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PutUserInfoDto, UpdateUserProfileDto, UserProfileResponseDto } from './dto/user.dto';
import { OnboardingCompleteDto, SwitchPetDto, SwitchCityDto } from './dto/onboarding.dto';
import { ApiResult, ErrorResponseDto } from '@app/core/common';
import { Request as ExpressRequest } from "express";

@ApiTags('user')
@UseInterceptors(ClassSerializerInterceptor)
@Controller("/user")
export class UserController {
	constructor(private readonly userService: UserService) { }

	@ApiOperation({ summary: '获取用户基本信息', description: '获取当前登录用户的基本信息' })
	@ApiBearerAuth('JWT-auth')
	@ApiResult(UserProfileResponseDto)
	@Get()
	async getUser(@Request() request: Request & { user: { id: string } }): Promise<UserProfileResponseDto> {
		return await this.userService.getUserProfile(request.user.id);
	}

	@ApiOperation({ 
		summary: '获取用户完整资料', 
		description: '获取包括ID、Pro状态、旅行券等完整用户信息' 
	})
	@ApiBearerAuth('JWT-auth')
	@ApiResult(UserProfileResponseDto)
	@Get('profile')
	async getUserProfile(@Request() request: Request & { user: { id: string } }): Promise<UserProfileResponseDto> {
		return await this.userService.getUserProfile(request.user.id);
	}

	@ApiOperation({ 
		summary: '更新用户资料', 
		description: '更新用户头像和昵称，支持部分更新（只传需要更新的字段）' 
	})
	@ApiBearerAuth('JWT-auth')
	@ApiResult(UserProfileResponseDto)
	@ApiResponse({ status: 404, description: '用户不存在', type: ErrorResponseDto })
	@Put('profile')
	async updateUserProfile(
		@Request() request: Request & { user: { id: string } },
		@Body() dto: UpdateUserProfileDto
	): Promise<UserProfileResponseDto> {
		return await this.userService.updateUserProfile(request.user.id, dto);
	}

	@ApiOperation({ summary: '创建用户' })
	@ApiResult(UserProfileResponseDto)
	@Post()
	async postUser(@Request() request: Request & { user: { openid: string } }, @Body() putUserInfoDto: PutUserInfoDto) {
		return await this.userService.editUser(request.user.openid, putUserInfoDto);
	}

	@ApiOperation({ summary: '修改用户' })
	@ApiResult(UserProfileResponseDto)
	@Put()
	async editUser(@Request() request: Request & { user: { openid: string } }, @Body() putUserInfoDto: PutUserInfoDto) {
		return await this.userService.editUser(request.user.openid, putUserInfoDto);
	}

	@ApiOperation({ 
		summary: '完成初始化流程',
		description: '用户首次登录后，完成宠物和城市的选择，以及用户昵称的设置'
	})
	@ApiBearerAuth('JWT-auth')
	@ApiResult(Boolean)
	@ApiResponse({ status: 400, description: '请求参数错误', type: ErrorResponseDto })
	@ApiResponse({ status: 401, description: '未授权', type: ErrorResponseDto })
	@Post('/onboarding/complete')
	async completeOnboarding(
		@Request() request: ExpressRequest,
		@Body() dto: OnboardingCompleteDto
	) {
		return await this.userService.completeOnboarding(
			request.user!.id,
			dto.petId,
			dto.cityId,
			dto.nickname,
			dto.initialSteps
		);
	}

	@ApiOperation({ 
		summary: '切换宠物',
		description: '用户切换当前使用的宠物'
	})
	@ApiBearerAuth('JWT-auth')
	@ApiResult(Boolean)
	@ApiResponse({ status: 200, description: '切换成功' })
	@ApiResponse({ status: 400, description: '请求参数错误', type: ErrorResponseDto })
	@ApiResponse({ status: 401, description: '未授权', type: ErrorResponseDto })
	@Post('/pet/switch')
	async switchPet(
		@Request() request: Request & { user: { id: string } },
		@Body() dto: SwitchPetDto
	) {
		return await this.userService.switchPet(request.user.id, dto.petId);
	}

	@ApiOperation({ 
		summary: '切换城市',
		description: '用户切换当前访问的城市'
	})
	@ApiBearerAuth('JWT-auth')
	@ApiResult(Boolean)
	@ApiResponse({ status: 200, description: '切换成功' })
	@ApiResponse({ status: 400, description: '请求参数错误', type: ErrorResponseDto })
	@ApiResponse({ status: 401, description: '未授权', type: ErrorResponseDto })
	@Post('/city/switch')
	async switchCity(
		@Request() request: Request & { user: { id: string } },
		@Body() dto: SwitchCityDto
	) {
		return await this.userService.switchCity(request.user.id, dto.cityId);
	}
}
