import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get('REDIS_HOST', 'redis');
    const port = this.configService.get('REDIS_PORT', 6379);
    const password = this.configService.get('REDIS_PASSWORD');
    const db = this.configService.get('REDIS_DB', 0);

    this.redis = new Redis({
      host,
      port: Number(port),
      password,
      db: Number(db),
      // enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      this.logger.log(`Redis connected to ${host}:${port}`);
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    try {
      await this.redis.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.disconnect();
      this.logger.log('Redis disconnected');
    }
  }

  /**
   * 获取 Redis 客户端实例
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * 设置键值对
   * @param key 键
   * @param value 值
   * @param ttl 过期时间（秒）
   */
  async set(key: string, value: string | number | Buffer, ttl: number = 0): Promise<'OK'> {
    if (ttl) {
      // 确保 TTL 是整数
      return await this.redis.setex(key, Math.floor(ttl), value);
    }
    return await this.redis.set(key, value);
  }

  /**
   * 获取值
   * @param key 键
   */
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  /**
   * 删除键
   * @param key 键
   */
  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  /**
   * 检查键是否存在
   * @param key 键
   */
  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }

  /**
   * 设置过期时间
   * @param key 键
   * @param ttl 过期时间（秒）
   */
  async expire(key: string, ttl: number): Promise<number> {
    // 确保 TTL 是整数
    return await this.redis.expire(key, Math.floor(ttl));
  }

  /**
   * 获取剩余过期时间
   * @param key 键
   */
  async ttl(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }

  /**
   * 设置哈希字段
   * @param key 键
   * @param field 字段
   * @param value 值
   */
  async hset(key: string, field: string, value: string | number): Promise<number> {
    return await this.redis.hset(key, field, value);
  }

  /**
   * 获取哈希字段值
   * @param key 键
   * @param field 字段
   */
  async hget(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }

  /**
   * 获取所有哈希字段
   * @param key 键
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(key);
  }

  /**
   * 删除哈希字段
   * @param key 键
   * @param field 字段
   */
  async hdel(key: string, field: string): Promise<number> {
    return await this.redis.hdel(key, field);
  }

  /**
   * 列表左推入
   * @param key 键
   * @param value 值
   */
  async lpush(key: string, ...value: (string | number)[]): Promise<number> {
    return await this.redis.lpush(key, ...value);
  }

  /**
   * 列表右推入
   * @param key 键
   * @param value 值
   */
  async rpush(key: string, ...value: (string | number)[]): Promise<number> {
    return await this.redis.rpush(key, ...value);
  }

  /**
   * 列表左弹出
   * @param key 键
   */
  async lpop(key: string): Promise<string | null> {
    return await this.redis.lpop(key);
  }

  /**
   * 列表右弹出
   * @param key 键
   */
  async rpop(key: string): Promise<string | null> {
    return await this.redis.rpop(key);
  }

  /**
   * 获取列表范围
   * @param key 键
   * @param start 开始位置
   * @param stop 结束位置
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redis.lrange(key, start, stop);
  }

  /**
   * 集合添加成员
   * @param key 键
   * @param member 成员
   */
  async sadd(key: string, ...member: (string | number)[]): Promise<number> {
    return await this.redis.sadd(key, ...member);
  }

  /**
   * 集合移除成员
   * @param key 键
   * @param member 成员
   */
  async srem(key: string, ...member: (string | number)[]): Promise<number> {
    return await this.redis.srem(key, ...member);
  }

  /**
   * 检查集合成员
   * @param key 键
   * @param member 成员
   */
  async sismember(key: string, member: string | number): Promise<number> {
    return await this.redis.sismember(key, member);
  }

  /**
   * 获取集合所有成员
   * @param key 键
   */
  async smembers(key: string): Promise<string[]> {
    return await this.redis.smembers(key);
  }

  /**
   * 原子递增
   * @param key 键
   * @param increment 增量
   */
  async incr(key: string, increment: number = 1): Promise<number> {
    if (increment === 1) {
      return await this.redis.incr(key);
    }
    // 确保增量是整数
    return await this.redis.incrby(key, Math.floor(increment));
  }

  /**
   * 原子递减
   * @param key 键
   * @param decrement 减量
   */
  async decr(key: string, decrement: number = 1): Promise<number> {
    if (decrement === 1) {
      return await this.redis.decr(key);
    }
    // 确保减量是整数
    return await this.redis.decrby(key, Math.floor(decrement));
  }

  /**
   * 发布消息
   * @param channel 频道
   * @param message 消息
   */
  async publish(channel: string, message: string): Promise<number> {
    return await this.redis.publish(channel, message);
  }

  /**
   * 订阅频道
   * @param channel 频道
   * @param callback 回调函数
   */
  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = this.redis.duplicate();
    await subscriber.subscribe(channel);
    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }

  /**
   * 批量执行命令
   * @param commands 命令数组
   */
  async pipeline(commands: Array<[string, ...any[]]>): Promise<any[]> {
    const pipeline = this.redis.pipeline();
    commands.forEach(([command, ...args]) => {
      pipeline[command](...args);
    });
    return await pipeline.exec();
  }

  /**
   * 执行 Lua 脚本
   * @param script Lua 脚本
   * @param keys 键数组
   * @param args 参数数组
   */
  async eval(script: string, keys: string[], args: (string | number)[]): Promise<any> {
    return await this.redis.eval(script, keys.length, ...keys, ...args);
  }

  /**
   * 健康检查
   */
  async ping(): Promise<string> {
    return await this.redis.ping();
  }

  /**
   * 获取 Redis 信息
   */
  async info(section?: string): Promise<string> {
    return await this.redis.info(section);
  }
}
