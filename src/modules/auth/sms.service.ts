import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 发送短信验证码
   * @param phone 手机号
   * @returns 是否发送成功
   */
  async sendCode(phone: string): Promise<boolean> {
    try {
      // TODO: 集成实际的短信服务（阿里云/腾讯云）
      // 这里先模拟发送成功
      console.log(`发送验证码到手机号: ${phone}`);
      
      // 模拟生成6位验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // TODO: 实际项目中应该存储到Redis，设置5分钟过期
      console.log(`验证码: ${code}`);
      
      return true;
    } catch (error) {
      console.error('发送短信验证码失败:', error);
      throw new BadRequestException('发送验证码失败，请稍后重试');
    }
  }

  /**
   * 验证短信验证码
   * @param phone 手机号
   * @param code 验证码
   * @returns 是否验证成功
   */
  async verifyCode(phone: string, code: string): Promise<boolean> {
    try {
      // TODO: 从Redis中获取验证码进行验证
      // 这里先模拟验证成功（实际项目中应该验证Redis中的验证码）
      console.log(`验证手机号: ${phone}, 验证码: ${code}`);
      
      // 模拟验证逻辑
      if (code.length >= 4 && code.length <= 6) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('验证短信验证码失败:', error);
      throw new BadRequestException('验证码验证失败');
    }
  }

  /**
   * 检查发送频率限制
   * @param phone 手机号
   * @returns 是否可以发送
   */
  async checkRateLimit(phone: string): Promise<boolean> {
    try {
      // TODO: 检查Redis中的发送记录，60秒内只能发送一次
      // 这里先模拟允许发送
      return true;
    } catch (error) {
      console.error('检查发送频率限制失败:', error);
      return false;
    }
  }
}
