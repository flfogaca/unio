import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RedisService,
      useFactory: async (configService: ConfigService) => {
        const redisService = new RedisService();
        const redisUrl = configService.get('REDIS_URL');
        
        if (redisUrl) {
          const url = new URL(redisUrl);
          await redisService.connect(
            url.hostname,
            parseInt(url.port) || 6379,
            url.password || undefined,
          );
        } else {
          await redisService.connect(
            configService.get('REDIS_HOST', 'localhost'),
            configService.get('REDIS_PORT', 6379),
            configService.get('REDIS_PASSWORD'),
          );
        }
        
        return redisService;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}

