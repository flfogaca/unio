import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VideoGateway } from './video.gateway';
import { QueueGateway } from './queue.gateway';
import { ChatGateway } from './chat.gateway';
import { ChatModule } from '../controllers/chat/chat.module';

@Module({
  imports: [
    ConfigModule,
    ChatModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [VideoGateway, QueueGateway, ChatGateway],
  exports: [VideoGateway, QueueGateway, ChatGateway],
})
export class GatewayModule {}
