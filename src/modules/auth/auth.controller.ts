import { Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { OneClickLoginDto, PhoneCodeLoginDto, SendSmsCodeDto, RefreshTokenDto } from './dto/phone-login.dto';
import { DouyinLoginDto, AppleLoginDto } from './dto/third-party-login.dto';
import {
	LoginResponseDto,
	RefreshTokenResponseDto,
} from './dto/auth-response.dto';
import { Public, ApiResult, ErrorResponseDto } from '@app/core/common';

@ApiTags('auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService
	) { }

	@Public()
	@ApiOperation({
		summary: '一键登录（阿里云）',
		description: '通过阿里云一键登录SDK获取的accessToken进行一键登录，后端自动获取手机号并注册/登录'
	})
	@ApiResult(LoginResponseDto)
	@ApiResponse({ status: 400, description: '请求参数错误', type: ErrorResponseDto })
	@Post('/phone/one-click')
	async oneClickLogin(@Body() dto: OneClickLoginDto): Promise<LoginResponseDto> {
		return await this.authService.oneClickLogin(dto);
	}

	@Public()
	@ApiOperation({
		summary: '发送短信验证码',
		description: '向指定手机号发送短信验证码'
	})
	@ApiResult(Boolean)
	@ApiResponse({ status: 400, description: '请求参数错误', type: ErrorResponseDto })
	@ApiResponse({ status: 429, description: '发送过于频繁，请稍后再试', type: ErrorResponseDto })
	@Post('/phone/send-code')
	async sendSmsCode(@Body() dto: SendSmsCodeDto): Promise<boolean> {
		return await this.authService.sendSmsCode(dto.phone);
	}

	@Public()
	@ApiOperation({
		summary: '验证码登录',
		description: '通过手机号和短信验证码进行登录'
	})
	@ApiResult(LoginResponseDto)
	@ApiResponse({ status: 400, description: '请求参数错误或验证码错误', type: ErrorResponseDto })
	@ApiResponse({ status: 429, description: '验证码发送过于频繁', type: ErrorResponseDto })
	@Post('/phone/code-login')
	async phoneCodeLogin(@Body() dto: PhoneCodeLoginDto): Promise<LoginResponseDto> {
		return await this.authService.phoneCodeLogin(dto);
	}

	@ApiOperation({
		summary: '刷新访问令牌',
		description: '使用有效的JWT令牌刷新获取新的访问令牌'
	})
	@ApiResult(RefreshTokenResponseDto)
	@ApiResponse({ status: 401, description: '令牌无效或已过期', type: ErrorResponseDto })
	@Post('/refresh')
	async refreshToken(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
		return await this.authService.refreshToken(dto.refreshToken);
	}

	@Public()
	@ApiOperation({
		summary: '抖音登录',
		description: '通过抖音授权token进行登录'
	})
	@ApiResult(LoginResponseDto)
	@ApiResponse({ status: 400, description: '请求参数错误', type: ErrorResponseDto })
	@ApiResponse({ status: 401, description: '抖音token验证失败', type: ErrorResponseDto })
	@Post('/third-party/douyin')
	async douyinLogin(@Body() dto: DouyinLoginDto): Promise<LoginResponseDto> {
		return await this.authService.douyinLogin(dto);
	}

	@Public()
	@ApiOperation({
		summary: 'Apple登录',
		description: '通过Apple ID token进行登录'
	})
	@ApiResult(LoginResponseDto)
	@ApiResponse({ status: 400, description: '请求参数错误', type: ErrorResponseDto })
	@ApiResponse({ status: 401, description: 'Apple token验证失败', type: ErrorResponseDto })
	@Post('/third-party/apple')
	async appleLogin(@Body() dto: AppleLoginDto): Promise<LoginResponseDto> {
		return await this.authService.appleLogin(dto);
	}
}
