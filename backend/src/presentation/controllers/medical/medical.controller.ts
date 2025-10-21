import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@/infrastructure/guards/roles.guard';
import { Roles } from '@/infrastructure/decorators/roles.decorator';
import {
  MedicalDoctorService,
  MedicalConsultationRequest,
} from '@/application/services/medical-doctor-simple.service';

@Controller('medical')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalController {
  constructor(private readonly medicalService: MedicalDoctorService) {}

  @Post('consultation/urgent')
  @Roles('paciente')
  async createUrgentConsultation(
    @Body() request: MedicalConsultationRequest,
    @Request() req: any
  ) {
    return this.medicalService.createUrgentConsultation({
      ...request,
      patientId: req.user.id,
    });
  }

  @Post('consultation/scheduled')
  @Roles('paciente')
  async createScheduledConsultation(
    @Body() request: MedicalConsultationRequest,
    @Request() req: any
  ) {
    return this.medicalService.createScheduledConsultation({
      ...request,
      patientId: req.user.id,
    });
  }

  @Get('consultations')
  @Roles('paciente', 'medico')
  async getConsultations(@Request() req: any) {
    if (req.user.role === 'paciente') {
      return this.medicalService.getPatientConsultations(req.user.id);
    } else {
      return this.medicalService.getProfessionalConsultations(req.user.id);
    }
  }
}
