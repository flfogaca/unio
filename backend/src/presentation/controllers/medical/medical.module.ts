import { Module } from '@nestjs/common';
import { MedicalController } from './medical.controller';
import { MedicalDoctorService } from '@/application/services/medical-doctor-simple.service';

@Module({
  controllers: [MedicalController],
  providers: [MedicalDoctorService],
  exports: [MedicalDoctorService],
})
export class MedicalModule {}
