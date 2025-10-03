import { Module } from '@nestjs/common';
import { WaitTimeController } from './wait-time.controller';
import { WaitTimeService } from '@/application/services/wait-time.service';

@Module({
  controllers: [WaitTimeController],
  providers: [WaitTimeService],
  exports: [WaitTimeService],
})
export class WaitTimeModule {}
