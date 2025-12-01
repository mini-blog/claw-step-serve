import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * 缓存键前缀
   */
  private readonly PREFIXES = {
    USER: 'user:',
    SMS_CODE: 'sms:code:',
    SMS_LIMIT: 'sms:limit:',
    SESSION: 'session:',
    RATE_LIMIT: 'rate:limit:',
    TOKEN: 'token:',
  };

  /**
   * 生成缓存键
   * @param prefix 前缀
   * @param key 键
   */
  private getKey(prefix: string, key: string): string {
    return `${prefix}${key}`;
  }

  /**
   * 用户相关缓存
   */
  async setUserCache(userId: string, data: any, ttl: number = 3600): Promise<void> {
    const key = this.getKey(this.PREFIXES.USER, userId);
    await this.redisService.set(key, JSON.stringify(data), Math.floor(ttl));
    this.logger.debug(`User cache set: ${key}`);
  }

  async getUserCache(userId: string): Promise<any | null> {
    const key = this.getKey(this.PREFIXES.USER, userId);
    const data = await this.redisService.get(key);
    if (data) {
      this.logger.debug(`User cache hit: ${key}`);
      return JSON.parse(data);
    }
    this.logger.debug(`User cache miss: ${key}`);
    return null;
  }

  async deleteUserCache(userId: string): Promise<void> {
    const key = this.getKey(this.PREFIXES.USER, userId);
    await this.redisService.del(key);
    this.logger.debug(`User cache deleted: ${key}`);
  }

  /**
   * 短信验证码缓存
   */
  async setSmsCode(phone: string, code: string, ttl: number = 300): Promise<void> {
    const key = this.getKey(this.PREFIXES.SMS_CODE, phone);
    await this.redisService.set(key, code, Math.floor(ttl));
    this.logger.debug(`SMS code set: ${phone}`);
  }

  async getSmsCode(phone: string): Promise<string | null> {
    const key = this.getKey(this.PREFIXES.SMS_CODE, phone);
    const code = await this.redisService.get(key);
    if (code) {
      this.logger.debug(`SMS code hit: ${phone}`);
      return code;
    }
    this.logger.debug(`SMS code miss: ${phone}`);
    return null;
  }

  async deleteSmsCode(phone: string): Promise<void> {
    const key = this.getKey(this.PREFIXES.SMS_CODE, phone);
    await this.redisService.del(key);
    this.logger.debug(`SMS code deleted: ${phone}`);
  }

  /**
   * 短信发送限制
   */
  async setSmsLimit(phone: string, ttl: number = 60): Promise<void> {
    const key = this.getKey(this.PREFIXES.SMS_LIMIT, phone);
    // 确保 TTL 是整数
    await this.redisService.set(key, '1', Math.floor(ttl));
    this.logger.debug(`SMS limit set: ${phone}`);
  }

  async checkSmsLimit(phone: string): Promise<boolean> {
    const key = this.getKey(this.PREFIXES.SMS_LIMIT, phone);
    const exists = await this.redisService.exists(key);
    const isLimited = exists === 1;
    this.logger.debug(`SMS limit check: ${phone} - ${isLimited ? 'limited' : 'allowed'}`);
    return isLimited;
  }

  /**
   * 会话缓存
   */
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    const key = this.getKey(this.PREFIXES.SESSION, sessionId);
    await this.redisService.set(key, JSON.stringify(data), Math.floor(ttl));
    this.logger.debug(`Session set: ${sessionId}`);
  }

  async getSession(sessionId: string): Promise<any | null> {
    const key = this.getKey(this.PREFIXES.SESSION, sessionId);
    const data = await this.redisService.get(key);
    if (data) {
      this.logger.debug(`Session hit: ${sessionId}`);
      return JSON.parse(data);
    }
    this.logger.debug(`Session miss: ${sessionId}`);
    return null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = this.getKey(this.PREFIXES.SESSION, sessionId);
    await this.redisService.del(key);
    this.logger.debug(`Session deleted: ${sessionId}`);
  }

  /**
   * 速率限制
   */
  async checkRateLimit(identifier: string, limit: number, window: number): Promise<boolean> {
    const key = this.getKey(this.PREFIXES.RATE_LIMIT, identifier);
    const current = await this.redisService.incr(key);
    
    if (current === 1) {
      // 确保 window 是整数
      await this.redisService.expire(key, Math.floor(window));
    }
    
    const isAllowed = current <= limit;
    this.logger.debug(`Rate limit check: ${identifier} - ${current}/${limit} - ${isAllowed ? 'allowed' : 'blocked'}`);
    return isAllowed;
  }

  /**
   * Token 黑名单
   */
  async addTokenToBlacklist(tokenId: string, ttl: number): Promise<void> {
    const key = this.getKey(this.PREFIXES.TOKEN, tokenId);
    await this.redisService.set(key, 'blacklisted', Math.floor(ttl));
    this.logger.debug(`Token blacklisted: ${tokenId}`);
  }

  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    const key = this.getKey(this.PREFIXES.TOKEN, tokenId);
    const exists = await this.redisService.exists(key);
    const isBlacklisted = exists === 1;
    this.logger.debug(`Token blacklist check: ${tokenId} - ${isBlacklisted ? 'blacklisted' : 'valid'}`);
    return isBlacklisted;
  }

  /**
   * 分布式锁
   */
  async acquireLock(lockKey: string, ttl: number = 10): Promise<boolean> {
    const key = `lock:${lockKey}`;
    const result = await this.redisService.set(key, '1', Math.floor(ttl));
    const acquired = result === 'OK';
    this.logger.debug(`Lock ${acquired ? 'acquired' : 'failed'}: ${lockKey}`);
    return acquired;
  }

  async releaseLock(lockKey: string): Promise<void> {
    const key = `lock:${lockKey}`;
    await this.redisService.del(key);
    this.logger.debug(`Lock released: ${lockKey}`);
  }

  /**
   * 批量操作
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    return await this.redisService.getClient().mget(...keys);
  }

  async mset(keyValuePairs: Record<string, string | number>): Promise<'OK'> {
    const args: (string | number)[] = [];
    for (const [key, value] of Object.entries(keyValuePairs)) {
      args.push(key, value);
    }
    return await this.redisService.getClient().mset(...args);
  }

  /**
   * 清空缓存
   */
  async clearCache(pattern: string = '*'): Promise<void> {
    const keys = await this.redisService.getClient().keys(pattern);
    if (keys.length > 0) {
      await this.redisService.getClient().del(...keys);
      this.logger.log(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    connectedClients: number;
  }> {
    const info = await this.redisService.info('memory');
    const keyspace = await this.redisService.info('keyspace');
    
    const totalKeys = Object.keys(keyspace).length;
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown';
    
    return {
      totalKeys,
      memoryUsage,
      connectedClients: 1, // 简化实现
    };
  }
}
