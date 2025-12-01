import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@app/core/modules/redis';
import { CustomHttpException } from '@app/core/common';
import Dypnsapi20170525, * as $Dypnsapi20170525 from '@alicloud/dypnsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';

@Injectable()
export class SmsService {
  private readonly aliyunClient: Dypnsapi20170525;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    // 初始化阿里云客户端
    const accessKeyId = this.configService.get<string>('ALIYUN_ACCESS_KEY_ID');
    const accessKeySecret = this.configService.get<string>('ALIYUN_ACCESS_KEY_SECRET');

    if (!accessKeyId || !accessKeySecret) {
      console.warn('阿里云AccessKey未配置，短信验证功能将不可用');
    }

    const config = new $OpenApi.Config({
      accessKeyId: accessKeyId || '',
      accessKeySecret: accessKeySecret || '',
      endpoint: 'dypnsapi.aliyuncs.com',
    });

    this.aliyunClient = new Dypnsapi20170525(config);
  }

  /**
   * 发送短信验证码
   * @param phone 手机号
   * @returns 是否发送成功
   */
  async sendCode(phone: string): Promise<boolean> {
    // 从环境变量读取短信配置
    const signName = this.configService.get<string>('ALIYUN_SMS_SIGN_NAME');
    const templateCode = this.configService.get<string>('ALIYUN_SMS_TEMPLATE_CODE');
    const codeLength = this.configService.get<number>('ALIYUN_SMS_CODE_LENGTH') || 6;
    const validTime = this.configService.get<number>('ALIYUN_SMS_VALID_TIME') || 300; // 默认5分钟
    const returnVerifyCode = this.configService.get<boolean>('ALIYUN_SMS_RETURN_CODE') || false; // 是否返回验证码（调试用）

    if (!signName || !templateCode) {
      console.error(`短信服务配置不完整: signName=${!!signName}, templateCode=${!!templateCode}`);
      throw new BadRequestException('服务暂时不可用，请稍后重试');
    }

    // 创建发送短信验证码请求
    const sendSmsRequest = new $Dypnsapi20170525.SendSmsVerifyCodeRequest({
      phoneNumber: phone,
      signName: signName,
      templateCode: templateCode,
      templateParam: JSON.stringify({
        code: '##code##', // 使用占位符，由系统自动生成验证码
        min: Math.floor(validTime / 60).toString(), // 转换为分钟
      }),
      codeLength: codeLength,
      validTime: validTime,
      interval: 55, // 发送间隔55秒
      codeType: 1, // 纯数字验证码
      returnVerifyCode: returnVerifyCode, // 是否返回验证码（生产环境建议设为false）
    });

    try {
      // 调用阿里云API发送验证码
      const result = await this.aliyunClient.sendSmsVerifyCode(sendSmsRequest);

      const body = result.body;
      if (!body || !body.success || body.code !== 'OK') {
        // 处理阿里云返回的错误
        const errorMessage = body?.message || '发送验证码失败';
        
        // 根据错误码返回相应的错误信息
        if (body?.code === 'MOBILE_NUMBER_ILLEGAL') {
          throw new BadRequestException('手机号码格式错误');
        }
        if (body?.code === 'BUSINESS_LIMIT_CONTROL') {
          throw new CustomHttpException({
            code: 429,
            message: '今日发送次数已达上限，请明天再试'
          });
        }
        if (body?.code === 'FREQUENCY_FAIL') {
          throw new CustomHttpException({
            code: 429,
            message: '发送过于频繁，请稍后再试'
          });
        }
        
        throw new BadRequestException(errorMessage);
      }

      // 如果返回了验证码（调试模式），存储到Redis以便本地验证
      // 注意：生产环境建议使用阿里云的 CheckSmsVerifyCode API 进行验证
      if (returnVerifyCode && body.model?.verifyCode) {
        await this.setSmsCode(phone, body.model.verifyCode, validTime);
      }
      
      // 设置发送限制
      await this.setSmsLimit(phone, 55);

      return true;
    } catch (error) {
      // 处理已知异常，直接抛出
      if (error instanceof BadRequestException || error instanceof CustomHttpException) {
        throw error;
      }

      // 处理阿里云SDK错误，转换为标准异常
      if (error?.code === 'InvalidAccessKeyId.NotFound' || error?.code === 'SignatureDoesNotMatch') {
        console.error(`阿里云短信服务配置错误: ${error?.code}`, error?.stack);
        throw new BadRequestException('服务暂时不可用，请稍后重试');
      }

      // 其他未知错误，转换为标准异常
      throw new BadRequestException(error?.message || '发送验证码失败，请稍后重试');
    }
  }

  /**
   * 验证短信验证码
   * @param phone 手机号
   * @param code 验证码
   * @returns 是否验证成功
   */
  async verifyCode(phone: string, code: string): Promise<boolean> {
    const accessKeyId = this.configService.get<string>('ALIYUN_ACCESS_KEY_ID');
    const accessKeySecret = this.configService.get<string>('ALIYUN_ACCESS_KEY_SECRET');

    // 如果未配置阿里云，回退到本地验证（兼容模式）
    if (!accessKeyId || !accessKeySecret) {
      console.warn('阿里云配置未完成，使用本地验证码验证');
      const storedCode = await this.cacheService.getSmsCode(phone);
      
      if (!storedCode) {
        console.log(`验证码已过期或不存在: ${phone}`);
        return false;
      }
      
      const isValid = storedCode === code;
      
      if (isValid) {
        await this.cacheService.deleteSmsCode(phone);
        console.log(`验证码验证成功: ${phone}`);
      } else {
        console.log(`验证码验证失败: ${phone}, 输入: ${code}, 存储: ${storedCode}`);
      }
      
      return isValid;
    }

    try {
      // 使用阿里云 CheckSmsVerifyCode API 验证
      const checkSmsRequest = new $Dypnsapi20170525.CheckSmsVerifyCodeRequest({
        phoneNumber: phone,
        verifyCode: code,
        countryCode: '86', // 默认中国
        caseAuthPolicy: 1, // 不区分大小写
      });

      const result = await this.aliyunClient.checkSmsVerifyCode(checkSmsRequest);

      const body = result.body;
      if (!body || !body.success || body.code !== 'OK') {
        // 接口调用失败
        const errorMessage = body?.message || '验证码验证失败';
        console.error(`验证码验证接口调用失败: ${errorMessage}`);
        return false;
      }

      // 检查验证结果
      const verifyResult = body.model?.verifyResult;
      const isValid = verifyResult === 'PASS';

      if (isValid) {
        // 验证成功后删除本地存储的验证码（如果存在）
        await this.cacheService.deleteSmsCode(phone);
        console.log(`验证码验证成功: ${phone}`);
      } else {
        console.log(`验证码验证失败: ${phone}, 验证结果: ${verifyResult || 'UNKNOWN'}`);
      }

      return isValid;
    } catch (error) {
      // 处理阿里云SDK错误，回退到本地验证
      if (error?.code === 'InvalidAccessKeyId.NotFound' || error?.code === 'SignatureDoesNotMatch') {
        console.error('阿里云配置错误，回退到本地验证');
        // 回退到本地验证
        const storedCode = await this.cacheService.getSmsCode(phone);
        if (storedCode && storedCode === code) {
          await this.cacheService.deleteSmsCode(phone);
          return true;
        }
        return false;
      }

      // 其他错误抛出异常，由全局异常过滤器处理
      throw new BadRequestException('验证码验证失败，请重试');
    }
  }

  /**
   * 检查发送频率限制
   * @param phone 手机号
   * @returns 是否可以发送
   */
  async checkRateLimit(phone: string): Promise<boolean> {
    // 检查Redis中的发送记录，60秒内只能发送一次
    const isLimited = await this.cacheService.checkSmsLimit(phone);
    return !isLimited;
  }

  /**
   * 设置短信验证码（用于外部服务直接设置验证码）
   * @param phone 手机号
   * @param code 验证码
   * @param ttl 过期时间（秒）
   */
  async setSmsCode(phone: string, code: string, ttl: number = 300): Promise<void> {
    await this.cacheService.setSmsCode(phone, code, ttl);
  }

  /**
   * 设置短信发送限制
   * @param phone 手机号
   * @param ttl 限制时长（秒）
   */
  async setSmsLimit(phone: string, ttl: number = 60): Promise<void> {
    await this.cacheService.setSmsLimit(phone, ttl);
  }
}
