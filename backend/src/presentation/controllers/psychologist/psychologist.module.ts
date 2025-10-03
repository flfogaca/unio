import { Module } from '@nestjs/common';
import { PsychologistController } from './psychologist.controller';
import { PsychologistService } from '@/application/services/psychologist-simple.service';

@Module({
  controllers: [PsychologistController],
  providers: [PsychologistService],
  exports: [PsychologistService],
})
export class PsychologistModule {}
