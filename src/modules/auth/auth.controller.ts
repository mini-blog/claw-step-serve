import { Body, ClassSerializerInterceptor, Controller, Post, Get, Req, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CheckPhoneDto, OneClickLoginDto, PhoneCodeLoginDto, SendSmsCodeDto } from './dto/phone-login.dto';
import { 
  LoginResponseDto, 
  CheckPhoneResponseDto, 
  RefreshTokenResponseDto, 
  SendSmsCodeResponseDto 
} from './dto/auth-response.dto';
import { Public } from '@app/core/common';
import { Request } from 'express';

@ApiTags('auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService
	) { }

	@Public()
	@ApiOperation({ 
		summary: '检查手机号是否已注册',
		description: '检查手机号是否已经在系统中注册，返回用户信息或提示未注册'
	})
	@ApiResponse({ status: 200, description: '检查成功', type: CheckPhoneResponseDto })
	@ApiResponse({ status: 400, description: '请求参数错误' })
	@Post('/check-phone')
	async checkPhone(@Body() dto: CheckPhoneDto): Promise<CheckPhoneResponseDto> {
		return await this.authService.checkPhone(dto.phone);
	}

	@Public()
	@ApiOperation({ 
		summary: '一键登录（移动商SDK）',
		description: '通过移动商SDK获取的accessToken进行一键登录'
	})
	@ApiResponse({ status: 200, description: '登录成功，返回用户信息和JWT令牌', type: LoginResponseDto })
	@ApiResponse({ status: 400, description: '请求参数错误' })
	@ApiResponse({ status: 401, description: 'SDK token验证失败' })
	@Post('/phone/one-click')
	async oneClickLogin(@Body() dto: OneClickLoginDto): Promise<LoginResponseDto> {
		return await this.authService.oneClickLogin(dto);
	}

	@Public()
	@ApiOperation({ 
		summary: '验证码登录',
		description: '通过手机号和短信验证码进行登录'
	})
	@ApiResponse({ status: 200, description: '登录成功，返回用户信息和JWT令牌', type: LoginResponseDto })
	@ApiResponse({ status: 400, description: '请求参数错误或验证码错误' })
	@ApiResponse({ status: 429, description: '验证码发送过于频繁' })
	@Post('/phone/code-login')
	async phoneCodeLogin(@Body() dto: PhoneCodeLoginDto): Promise<LoginResponseDto> {
		return await this.authService.phoneCodeLogin(dto);
	}

	@Public()
	@ApiOperation({ 
		summary: '发送短信验证码',
		description: '向指定手机号发送短信验证码'
	})
	@ApiResponse({ status: 200, description: '验证码发送成功', type: SendSmsCodeResponseDto })
	@ApiResponse({ status: 400, description: '请求参数错误' })
	@ApiResponse({ status: 429, description: '发送过于频繁，请稍后再试' })
	@Post('/phone/send-code')
	async sendSmsCode(@Body() dto: SendSmsCodeDto): Promise<SendSmsCodeResponseDto> {
		return await this.authService.sendSmsCode(dto.phone);
	}

	@ApiOperation({ 
		summary: '刷新访问令牌',
		description: '使用有效的JWT令牌刷新获取新的访问令牌'
	})
	@ApiBearerAuth('JWT-auth')
	@ApiResponse({ status: 200, description: '令牌刷新成功', type: RefreshTokenResponseDto })
	@ApiResponse({ status: 401, description: '令牌无效或已过期' })
	@Get('/refresh')
	async refreshToken(@Req() request: Request): Promise<RefreshTokenResponseDto> {
		return await this.authService.refreshToken(request.user);
	}
}
