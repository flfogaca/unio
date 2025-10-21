import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;

  async connect(host: string, port: number, password?: string) {
    this.client = createClient({
      socket: {
        host,
        port,
      },
      password,
    });

    this.client.on('error', err => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('🔗 Redis connected successfully');
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      console.log('🔌 Redis disconnected');
    }
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Session management
  async setSession(
    sessionId: string,
    userId: string,
    ttl: number = 24 * 60 * 60
  ): Promise<void> {
    await this.set(`session:${sessionId}`, userId, ttl);
  }

  async getSession(sessionId: string): Promise<string | null> {
    return this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async incrementRateLimit(key: string, window: number): Promise<number> {
    const current = await this.client.incr(key);
    if (current === 1) {
      await this.client.expire(key, window);
    }
    return current;
  }

  async checkRateLimit(
    key: string,
    limit: number
  ): Promise<{ allowed: boolean; count: number; ttl: number }> {
    const count = await this.client.get(key);
    const ttl = await this.client.ttl(key);

    const currentCount = count ? parseInt(count) : 0;

    return {
      allowed: currentCount < limit,
      count: currentCount,
      ttl: ttl > 0 ? ttl : 0,
    };
  }

  // Queue management
  async addToQueue(queueName: string, item: string): Promise<void> {
    await this.client.lPush(queueName, item);
  }

  async removeFromQueue(queueName: string, item: string): Promise<void> {
    await this.client.lRem(queueName, 1, item);
  }

  async getQueue(queueName: string): Promise<string[]> {
    return this.client.lRange(queueName, 0, -1);
  }

  async getQueueLength(queueName: string): Promise<number> {
    return this.client.lLen(queueName);
  }

  // Real-time notifications
  async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  // Cache management
  async setCache(key: string, data: any, ttl: number = 300): Promise<void> {
    const serialized = JSON.stringify(data);
    await this.set(`cache:${key}`, serialized, ttl);
  }

  async getCache<T>(key: string): Promise<T | null> {
    const cached = await this.get(`cache:${key}`);
    if (!cached) return null;

    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  async invalidateCache(pattern: string): Promise<void> {
    const keys = await this.client.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  // User presence
  async setUserOnline(userId: string, ttl: number = 300): Promise<void> {
    await this.set(`user:online:${userId}`, '1', ttl);
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.del(`user:online:${userId}`);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    return this.exists(`user:online:${userId}`);
  }

  async getOnlineUsers(): Promise<string[]> {
    const keys = await this.client.keys('user:online:*');
    return keys.map(key => key.replace('user:online:', ''));
  }

  // Video call rooms
  async createVideoRoom(
    roomId: string,
    consultationId: string,
    ttl: number = 7200
  ): Promise<void> {
    await this.set(`video:room:${roomId}`, consultationId, ttl);
  }

  async getVideoRoom(roomId: string): Promise<string | null> {
    return this.get(`video:room:${roomId}`);
  }

  async deleteVideoRoom(roomId: string): Promise<void> {
    await this.del(`video:room:${roomId}`);
  }

  // Statistics
  async incrementStats(key: string, value: number = 1): Promise<number> {
    return this.client.incrBy(key, value);
  }

  async getStats(key: string): Promise<number> {
    const result = await this.client.get(key);
    return result ? parseInt(result) : 0;
  }

  async resetStats(key: string): Promise<void> {
    await this.del(key);
  }
}
