import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Push20160801 from '@alicloud/push20160801';
import * as OpenApi from '@alicloud/openapi-client';
import { NotificationType } from '../dto/notification.dto';

interface ExtParameters {
  type: NotificationType;
  [key: string]: any;
} 

@Injectable()
export class PushService {
  private client: Push20160801.default;
  private readonly logger = new Logger(PushService.name);

  constructor(private configService: ConfigService) {
    const config = new OpenApi.Config({
      accessKeyId: this.configService.get('ALIYUN_ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get('ALIYUN_ACCESS_KEY_SECRET'),
    });
    config.endpoint = 'cloudpush.aliyuncs.com';
    this.client = new Push20160801.default(config);
  }

  /**
   * 推送消息给指定账号
   * @param userId 用户ID (Account)
   * @param title 标题
   * @param body 内容
   * @param extParameters 扩展参数
   */
  async pushToAccount(
    userId: string,
    title: string,
    body: string,
    extParameters: ExtParameters,
  ) {
    const androidAppKey = this.configService.get('ALIYUN_PUSH_APP_KEY_ANDROID');
    const iosAppKey = this.configService.get('ALIYUN_PUSH_APP_KEY_IOS');
    
    const promises = [];

    // 推送到 Android
    if (androidAppKey) {
      const androidRequest = new Push20160801.PushRequest({
        appKey: androidAppKey,
        target: 'ACCOUNT',
        targetValue: userId,
        pushType: 'NOTICE',
        deviceType: 'ANDROID',
        title: title,
        body: body,
        androidOpenType: 'APPLICATION',
        androidExtParameters: JSON.stringify(extParameters),
      });

      promises.push(
        this.client.push(androidRequest)
          .then(response => {
            this.logger.log(`Push to Android ${userId} success: ${response.body.messageId}`);
            return response.body;
          })
          .catch(error => {
            this.logger.error(`Push to Android ${userId} failed:`, error);
            return null;
          })
      );
    } else {
      this.logger.warn('ALIYUN_PUSH_APP_KEY_ANDROID not configured');
    }

    // 推送到 iOS
    if (iosAppKey) {
      const iosRequest = new Push20160801.PushRequest({
        appKey: iosAppKey,
        target: 'ACCOUNT',
        targetValue: userId,
        pushType: 'NOTICE',
        deviceType: 'iOS',
        title: title,
        body: body,
        iOSExtParameters: JSON.stringify(extParameters),
        iOSApnsEnv:'PRODUCT',
      });

      promises.push(
        this.client.push(iosRequest)
          .then(response => {
            this.logger.log(`Push to iOS ${userId} success: ${response.body.messageId}`);
            return response.body;
          })
          .catch(error => {
            // 忽略特定错误，比如没有iOS设备绑定
            this.logger.error(`Push to iOS ${userId} failed:`, error);
            return null;
          })
      );
    } else {
      this.logger.warn('ALIYUN_PUSH_APP_KEY_IOS not configured');
    }

    const results = await Promise.all(promises);
    return results;
  }
}
