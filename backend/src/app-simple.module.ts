import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/external-services/redis.module';
import { AuthModule } from './presentation/controllers/auth/auth.module';
import { UsersModule } from './presentation/controllers/users/users.module';
import { PsychologistModule } from './presentation/controllers/psychologist/psychologist.module';
import { MedicalModule } from './presentation/controllers/medical/medical.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    UsersModule,
    PsychologistModule,
    MedicalModule,
  ],
})
export class AppSimpleModule {}
