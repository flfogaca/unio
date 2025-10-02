import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Shared modules
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/external-services/redis.module';

// Feature modules
import { AuthModule } from './presentation/controllers/auth/auth.module';
import { UsersModule } from './presentation/controllers/users/users.module';
import { ConsultationsModule } from './presentation/controllers/consultations/consultations.module';
import { SpecialtiesModule } from './presentation/controllers/specialties/specialties.module';
import { MedicalRecordsModule } from './presentation/controllers/medical-records/medical-records.module';
import { VideoModule } from './presentation/controllers/video/video.module';

// Global interceptors and filters
import { ResponseInterceptor } from './presentation/interceptors/response.interceptor';
import { LoggingInterceptor } from './presentation/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './presentation/filters/global-exception.filter';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000,
        limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100'),
      },
    ]),

    // Infrastructure modules
    DatabaseModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ConsultationsModule,
    SpecialtiesModule,
    MedicalRecordsModule,
    VideoModule,
  ],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    // Global filters
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
