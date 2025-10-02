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
        await redisService.connect(
          configService.get('REDIS_HOST', 'localhost'),
          configService.get('REDIS_PORT', 6379),
          configService.get('REDIS_PASSWORD'),
        );
        return redisService;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}

