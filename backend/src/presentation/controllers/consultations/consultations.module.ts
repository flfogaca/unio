import { Module, forwardRef } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from '@/application/services/consultations.service';
import { SpecialtyFilterService } from '@/shared/services/specialty-filter.service';
import { WaitTimeModule } from '../wait-time/wait-time.module';

@Module({
  imports: [forwardRef(() => WaitTimeModule)],
  controllers: [ConsultationsController],
  providers: [ConsultationsService, SpecialtyFilterService],
  exports: [ConsultationsService, SpecialtyFilterService],
})
export class ConsultationsModule {}
