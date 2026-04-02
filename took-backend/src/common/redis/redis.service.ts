import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
    });
  }

  async setCache(key: string, value: string, ttlSeconds = 60): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  getCache(key: string): Promise<string | null> {
    return this.client.get(key);
  }


  async deleteCache(key: string): Promise<void> {
    await this.client.del(key);
  }

  enqueue(queueName: string, payload: string): Promise<number> {
    return this.client.lpush(`queue:${queueName}`, payload);
  }

  dequeue(queueName: string): Promise<string | null> {
    return this.client.rpop(`queue:${queueName}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
