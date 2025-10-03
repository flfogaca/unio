import { Module } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from '@/application/services/consultations.service';
import { SpecialtyFilterService } from '@/shared/services/specialty-filter.service';

@Module({
  controllers: [ConsultationsController],
  providers: [ConsultationsService, SpecialtyFilterService],
  exports: [ConsultationsService, SpecialtyFilterService],
})
export class ConsultationsModule {}
