import { Injectable, Logger } from '@nestjs/common';
import * as OSS from 'ali-oss';
import { ConfigService } from '@nestjs/config';
import { uuidv7 } from 'uuidv7';
import * as path from 'path';

@Injectable()
export class UploadService {
  private client: OSS;
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {
    this.client = new OSS({
      region: this.configService.get<string>('OSS_REGION'),
      bucket: this.configService.get<string>('OSS_BUCKET'),
      accessKeyId: this.configService.get<string>('ALIYUN_ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get<string>('ALIYUN_ACCESS_KEY_SECRET'),
      // 如果使用自定义域名，可以在这里配置
      // endpoint: this.configService.get<string>('OSS_ENDPOINT'),
      // secure: true,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const extension = path.extname(file.originalname);
      const filename = `${uuidv7()}${extension}`;
      // 可以根据日期分目录存储
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const objectName = `uploads/${year}/${month}/${day}/${filename}`;

      const result = await this.client.put(objectName, file.buffer);
      
      // 如果配置了自定义域名，可以返回自定义域名的 URL
      // const domain = this.configService.get<string>('OSS_DOMAIN');
      // if (domain) {
      //   return `${domain}/${objectName}`;
      // }
      
      return result.url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw error;
    }
  }
}

