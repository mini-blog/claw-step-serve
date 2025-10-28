import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { SmsService } from './sms.service';
import { OneClickLoginDto, PhoneCodeLoginDto } from './dto/phone-login.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly smsService: SmsService,
	) { }

	async refresh(user: User) {
		return {
			accessToken: this.jwtService.sign({ id: user.id }, { expiresIn: '30d' }),
			refreshToken: this.jwtService.sign({ id: user.id }, { expiresIn: '60d' }),
		}
	}

	/**
	 * 刷新访问令牌
	 * @param user 用户信息
	 * @returns 新的访问令牌
	 */
	async refreshToken(user: any) {
		// 验证用户是否存在
		const existingUser = await this.userService.getUserById(user.id);
		if (!existingUser) {
			throw new UnauthorizedException('用户不存在');
		}

		// 生成新的访问令牌
		const newAccessToken = this.jwtService.sign(
			{ id: user.id }, 
			{ expiresIn: '30d' }
		);

		return {
			accessToken: newAccessToken,
			user: {
				id: existingUser.id,
				phone: existingUser.phone,
				nickname: existingUser.nickname,
				avatar: existingUser.avatar,
				isPro: existingUser.isPro,
				language: existingUser.language
			}
		};
	}

	/**
	 * 检查手机号是否已注册
	 * @param phone 手机号
	 * @returns 检查结果
	 */
	async checkPhone(phone: string) {
		const user = await this.userService.getUserByPhone(phone);
		return {
			exists: !!user,
			userId: user?.id,
			user: user ? {
				id: user.id,
				phone: user.phone,
				nickname: user.nickname,
				avatar: user.avatar,
				isPro: user.isPro,
				language: user.language
			} : null
		};
	}

	/**
	 * 一键登录（移动商SDK）
	 * @param dto 一键登录DTO
	 * @returns 用户信息和JWT令牌
	 */
	async oneClickLogin(dto: OneClickLoginDto) {
		try {
			// TODO: 验证移动商SDK的accessToken
			// 这里先模拟验证成功
			console.log(`验证移动商SDK token: ${dto.accessToken}`);
			
			// 生成一个模拟的openid
			const mockOpenid = `phone_${dto.phone}_${Date.now()}`;
			
			// 查询用户是否存在
			let user = await this.userService.getUserByPhoneAndOpenid(dto.phone, mockOpenid);
			
			// 如果用户不存在，创建新用户
			if (!user) {
				user = await this.userService.createPhoneUser({
					phone: dto.phone,
					openid: mockOpenid,
					nickname: `用户${dto.phone.slice(-4)}`
				});
			}
			
			// 生成JWT令牌
			const tokens = await this.refresh(user);
			
			return {
				user: {
					id: user.id,
					phone: user.phone,
					nickname: user.nickname,
					avatar: user.avatar,
					isPro: user.isPro,
					language: user.language
				},
				...tokens
			};
		} catch (error) {
			console.error('一键登录失败:', error);
			throw new BadRequestException('一键登录失败，请重试');
		}
	}

	/**
	 * 验证码登录
	 * @param dto 验证码登录DTO
	 * @returns 用户信息和JWT令牌
	 */
	async phoneCodeLogin(dto: PhoneCodeLoginDto) {
		try {
			// 验证短信验证码
			const isValidCode = await this.smsService.verifyCode(dto.phone, dto.code);
			if (!isValidCode) {
				throw new BadRequestException('验证码错误或已过期');
			}
			
			// 查询用户是否存在
			let user = await this.userService.getUserByPhone(dto.phone);
			
			// 如果用户不存在，创建新用户
			if (!user) {
				user = await this.userService.createPhoneUser({
					phone: dto.phone,
					nickname: `用户${dto.phone.slice(-4)}`
				});
			}
			
			// 生成JWT令牌
			const tokens = await this.refresh(user);
			
			return {
				user: {
					id: user.id,
					phone: user.phone,
					nickname: user.nickname,
					avatar: user.avatar,
					isPro: user.isPro,
					language: user.language
				},
				...tokens
			};
		} catch (error) {
			console.error('验证码登录失败:', error);
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException('验证码登录失败，请重试');
		}
	}

	/**
	 * 发送短信验证码
	 * @param phone 手机号
	 * @returns 发送结果
	 */
	async sendSmsCode(phone: string) {
		try {
			// 检查发送频率限制
			const canSend = await this.smsService.checkRateLimit(phone);
			if (!canSend) {
				throw new BadRequestException('发送过于频繁，请稍后再试');
			}
			
			// 发送验证码
			const success = await this.smsService.sendCode(phone);
			if (!success) {
				throw new BadRequestException('发送验证码失败，请稍后重试');
			}
			
			return {
				success: true,
				message: '验证码已发送'
			};
		} catch (error) {
			console.error('发送短信验证码失败:', error);
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new BadRequestException('发送验证码失败，请稍后重试');
		}
	}
}