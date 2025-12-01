import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { SmsService } from './sms.service';
import { OneClickLoginDto, PhoneCodeLoginDto } from './dto/phone-login.dto';
import { DouyinLoginDto, AppleLoginDto } from './dto/third-party-login.dto';
import { ConfigService } from '@nestjs/config';
import Dypnsapi20170525, * as $Dypnsapi20170525 from '@alicloud/dypnsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import { CustomHttpException } from '@app/core/common';

@Injectable()
export class AuthService {
	private readonly aliyunClient: Dypnsapi20170525;

	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly smsService: SmsService,
		private readonly configService: ConfigService,
	) {
		// 初始化阿里云客户端
		const accessKeyId = this.configService.get<string>('ALIYUN_ACCESS_KEY_ID');
		const accessKeySecret = this.configService.get<string>('ALIYUN_ACCESS_KEY_SECRET');

		if (!accessKeyId || !accessKeySecret) {
			console.error(`阿里云配置未完成: accessKeyId=${!!accessKeyId}, accessKeySecret=${!!accessKeySecret}`);
			throw new BadRequestException('服务暂时不可用，请稍后重试');
		}

		// 直接使用Config配置，传入accessKeyId和accessKeySecret
		const config = new $OpenApi.Config({
			accessKeyId: accessKeyId || '',
			accessKeySecret: accessKeySecret || '',
			endpoint: 'dypnsapi.aliyuncs.com',
		});

		this.aliyunClient = new Dypnsapi20170525(config);
	}

	async refresh(user: User) {
		return {
			accessToken: this.jwtService.sign({ id: user.id }, { expiresIn: '30d' }),
			refreshToken: this.jwtService.sign(
				{ id: user.id }, 
				{ 
					secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
					expiresIn: '60d' 
				}
			),
		}
	}

	/**
	 * 刷新访问令牌
	 * @param token 刷新令牌
	 * @returns 新的访问令牌
	 */
	async refreshToken(token: string) {
		let payload: any;
		try {
			payload = await this.jwtService.verifyAsync(token, {
				secret: this.configService.get('JWT_REFRESH_SECRET_KEY')
			});
		} catch (e) {
			throw new UnauthorizedException('令牌无效或已过期');
		}

		if (!payload || !payload.id) {
			throw new UnauthorizedException('令牌无效');
		}

		// 验证用户是否存在
		const existingUser = await this.userService.getUserById(payload.id);
		if (!existingUser) {
			throw new UnauthorizedException('用户不存在');
		}

		return await this.refresh(existingUser);
	}

	/**
	 * 一键登录（移动商SDK）
	 * @param dto 一键登录DTO
	 * @returns 用户信息和JWT令牌
	 */
	async oneClickLogin(dto: OneClickLoginDto) {
		// 1. 通过阿里云SDK获取手机号
		const phone = await this.getMobileString(dto.accessToken);

		// 2. 查询用户是否存在
		let user = await this.userService.getUserByPhone(phone);

		const isNewUser = !user;
		// 3. 如果用户不存在，创建新用户
		if (isNewUser) {
			// 生成一个基于手机号的openid
			const openid = `phone_${phone}`;
			user = await this.userService.createPhoneUser({
				phone: phone,
				openid: openid,
				nickname: `用户${phone.slice(-4)}`,
				language: 'zh_CN'
			});
		}

		// 4. 生成JWT令牌
		const tokens = await this.refresh(user);

		return {
			isNew: isNewUser,
			...tokens
		};
	}

	/**
	 * 验证码登录
	 * @param dto 验证码登录DTO
	 * @returns 用户信息和JWT令牌
	 */
	async phoneCodeLogin(dto: PhoneCodeLoginDto) {
		// 验证短信验证码
		const isValidCode = await this.smsService.verifyCode(dto.phone, dto.code);
		if (!isValidCode) {
			throw new BadRequestException('验证码错误或已过期');
		}

		// 查询用户是否存在
		let user = await this.userService.getUserByPhone(dto.phone);

		const isNewUser = !user;
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
			isNew: isNewUser,
			...tokens
		};
	}

	/**
	 * 发送短信验证码
	 * @param phone 手机号
	 * @returns 发送结果
	 */
	async sendSmsCode(phone: string) {
		// 检查发送频率限制
		const canSend = await this.smsService.checkRateLimit(phone);
		if (!canSend) {
			throw new CustomHttpException({
				code: 429,
				message: '发送过于频繁，请稍后再试'
			});
		}

		// 调用短信服务发送验证码
		const success = await this.smsService.sendCode(phone);
		if (!success) {
			throw new BadRequestException('发送验证码失败，请稍后重试');
		}

		return true;
	}

	/**
	 * 抖音登录
	 * @param dto 抖音登录DTO
	 * @returns 用户信息和JWT令牌
	 */
	async douyinLogin(dto: DouyinLoginDto) {
		// TODO: 验证抖音accessToken
		// 这里需要调用抖音API验证token，获取用户信息
		// const douyinUserInfo = await this.verifyDouyinToken(dto.accessToken);

		// 如果提供了openid，使用提供的；否则从token验证中获取
		const openid = dto.openid || `douyin_${Date.now()}_${Math.random().toString(36).substring(7)}`;

		// 查询用户是否存在
		let user = await this.userService.getUserByOpenid(openid);
		const isNewUser = !user;
		// 如果用户不存在，创建新用户
		if (!user) {
			user = await this.userService.createThirdPartyUser({
				openid: openid,
				nickname: dto.nickname || '抖音用户',
				avatar: dto.avatar,
				language: 'zh_CN'
			});
		} else {
			// 如果用户存在，更新昵称和头像（如果提供了新的）
			if (dto.nickname && dto.nickname !== user.nickname) {
				// 可以在这里更新用户信息
				// await this.userService.updateUser(user.id, { nickname: dto.nickname, avatar: dto.avatar });
			}
		}

		// 生成JWT令牌
		const tokens = await this.refresh(user);

		return {
			isNew: isNewUser,
			...tokens
		};
	}

	/**
	 * Apple登录
	 * @param dto Apple登录DTO
	 * @returns 用户信息和JWT令牌
	 */
	async appleLogin(dto: AppleLoginDto) {
		// TODO: 验证Apple identityToken
		// 这里需要验证JWT token，解析出用户信息
		// const appleUserInfo = await this.verifyAppleToken(dto.identityToken);

		// 如果提供了userIdentifier，使用提供的；否则从token验证中获取
		const openid = dto.userIdentifier || `apple_${Date.now()}_${Math.random().toString(36).substring(7)}`;

		// 如果提供了email，尝试通过email+openid查询
		let user: User | null = null;
		if (dto.email) {
			user = await this.userService.getUserByEmailAndOpenid(dto.email, openid);
		}

		// 如果通过email+openid没找到，尝试通过openid查询
		if (!user) {
			user = await this.userService.getUserByOpenid(openid);
		}

		const isNewUser = !user;

		// 如果用户不存在，创建新用户
		if (!user) {
			// 解析fullName获取nickname
			let nickname = dto.fullName || 'Apple用户';
			if (dto.fullName && typeof dto.fullName === 'string') {
				try {
					const nameObj = JSON.parse(dto.fullName);
					nickname = nameObj.givenName || nameObj.familyName || nickname;
				} catch {
					// 如果不是JSON，直接使用
					nickname = dto.fullName;
				}
			}

			user = await this.userService.createAppleUser({
				openid: openid,
				email: dto.email,
				nickname: nickname,
				language: 'zh_CN'
			});
		}

		// 生成JWT令牌
		const tokens = await this.refresh(user);

		return {
			isNew: isNewUser,
			...tokens
		};
	}

	/**
	 * 通过阿里云一键登录获取手机号 (私有方法)
	 * @param accessToken 前端SDK返回的accessToken
	 * @returns 手机号
	 */
	private async getMobileString(accessToken: string): Promise<string> {
		const accessKeyId = this.configService.get<string>('ALIYUN_ACCESS_KEY_ID');
		const accessKeySecret = this.configService.get<string>('ALIYUN_ACCESS_KEY_SECRET');

		if (!accessKeyId || !accessKeySecret) {
			throw new BadRequestException('阿里云配置未完成，请联系管理员');
		}

		try {
			// 创建请求对象
			const getMobileRequest = new $Dypnsapi20170525.GetMobileRequest({
				accessToken: accessToken,
			});

			// 调用API
			const result = await this.aliyunClient.getMobile(getMobileRequest);

			const body = result.body;
			if (!body || body.code !== 'OK') {
				throw new BadRequestException(body?.message || '获取手机号失败');
			}

			const mobile = body.getMobileResultDTO?.mobile;
			if (!mobile) {
				throw new BadRequestException('未能获取到手机号');
			}

			return mobile;
		} catch (error) {
			// 处理已知异常，直接抛出
			if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
				throw error;
			}
			// 处理阿里云SDK的错误，转换为标准异常
			if (error?.code === 'InvalidAccessKeyId.NotFound' || error?.code === 'SignatureDoesNotMatch') {
				console.error(`阿里云一键登录配置错误: ${error?.code}`, error?.stack);
				throw new BadRequestException('服务暂时不可用，请稍后重试');
			}
			if (error?.code === 'InvalidAccessToken') {
				throw new UnauthorizedException('accessToken无效或已过期');
			}
			// 处理新SDK的错误格式
			if (error?.data?.recommend) {
				console.error('错误诊断地址:', error.data.recommend);
			}
			// 其他未知错误，转换为标准异常
			throw new CustomHttpException({
				code: 400,
				message: error?.message || '获取手机号失败，请重试'
			});
		}
	}
}