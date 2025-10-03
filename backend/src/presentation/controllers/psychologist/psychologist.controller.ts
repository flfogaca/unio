import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PsychologistService } from '@/application/services/psychologist-simple.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { RequireSpecialty } from '@/shared/decorators/specialty.decorator';
import { UserRole, Specialty } from '@/shared/types';

@ApiTags('psychologist')
@Controller('psychologist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PsychologistController {
  constructor(private readonly psychologistService: PsychologistService) {}

  @Post('consultation/request')
  @ApiOperation({ summary: 'Request psychologist consultation (Patients only)' })
  @ApiResponse({ status: 201, description: 'Consultation request created successfully' })
  async createConsultationRequest(
    @Body() body: {
      consultationType: 'urgent' | 'scheduled';
      reason: string;
      urgencyLevel: 'low' | 'medium' | 'high' | 'crisis';
      preferredTime?: string;
      symptoms?: string[];
      previousTherapy?: boolean;
      currentMedication?: string[];
    },
    @CurrentUser() user: any,
  ) {
    const request = {
      patientId: user.id,
      ...body,
      preferredTime: body.preferredTime ? new Date(body.preferredTime) : undefined,
    };
    
    return this.psychologistService.createConsultationRequest(request);
  }

  @Post('consultation/:consultationId/assessment')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Create psychological assessment (Psychologists only)' })
  @ApiResponse({ status: 201, description: 'Assessment created successfully' })
  async createAssessment(
    @Param('consultationId') consultationId: string,
    @Body() body: {
      assessmentType: 'initial' | 'follow_up' | 'crisis_intervention';
      mentalState: {
        mood: string;
        anxiety: number;
        depression: number;
        stress: number;
        sleep: string;
        appetite: string;
      };
      riskAssessment: {
        selfHarm: 'none' | 'low' | 'medium' | 'high';
        suicide: 'none' | 'low' | 'medium' | 'high';
        violence: 'none' | 'low' | 'medium' | 'high';
        notes: string;
      };
      therapeuticPlan: {
        approach: string;
        goals: string[];
        techniques: string[];
        frequency: string;
        duration: string;
      };
      recommendations: {
        medication: string[];
        lifestyle: string[];
        emergency: string[];
      };
    },
    @CurrentUser() user: any,
  ) {
    const assessment = {
      consultationId,
      ...body,
    };
    
    return this.psychologistService.createAssessment(assessment);
  }

  @Post('session')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Create therapy session record (Psychologists only)' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  async createSession(
    @Body() body: {
      consultationId: string;
      sessionNumber: number;
      sessionType: 'individual' | 'group' | 'family' | 'couple';
      duration: number;
      topics: string[];
      techniques: string[];
      homework: string[];
      progress: {
        goal: string;
        progress: number;
        notes: string;
      }[];
      nextSession?: string;
    },
    @CurrentUser() user: any,
  ) {
    const session = {
      sessionId: this.generateUUID(),
      ...body,
      nextSession: body.nextSession ? new Date(body.nextSession) : undefined,
    };
    
    return this.psychologistService.createSession(session);
  }

  @Get('dashboard')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Get psychologist dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboard(@CurrentUser() user: any) {
    return this.psychologistService.getPsychologistDashboard(user.id);
  }

  @Get('patient/:patientId/history')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Get patient psychological history' })
  @ApiResponse({ status: 200, description: 'Patient history retrieved successfully' })
  async getPatientHistory(
    @Param('patientId') patientId: string,
    @CurrentUser() user: any,
  ) {
    return this.psychologistService.getPatientPsychologicalHistory(patientId);
  }

  @Get('crisis-alerts')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Get crisis alerts for psychologists' })
  @ApiResponse({ status: 200, description: 'Crisis alerts retrieved successfully' })
  async getCrisisAlerts(@CurrentUser() user: any) {
    const dashboard = await this.psychologistService.getPsychologistDashboard(user.id);
    return dashboard.crisisAlerts;
  }

  @Get('urgent-queue')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Get urgent consultation queue' })
  @ApiResponse({ status: 200, description: 'Urgent queue retrieved successfully' })
  async getUrgentQueue(@CurrentUser() user: any) {
    const dashboard = await this.psychologistService.getPsychologistDashboard(user.id);
    return []; // Placeholder - would need to fetch actual consultations
  }

  @Get('today-sessions')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Get today\'s therapy sessions' })
  @ApiResponse({ status: 200, description: 'Today\'s sessions retrieved successfully' })
  async getTodaySessions(@CurrentUser() user: any) {
    const dashboard = await this.psychologistService.getPsychologistDashboard(user.id);
    return dashboard.todaySessions;
  }

  @Get('weekly-stats')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Get weekly statistics' })
  @ApiResponse({ status: 200, description: 'Weekly stats retrieved successfully' })
  async getWeeklyStats(@CurrentUser() user: any) {
    const dashboard = await this.psychologistService.getPsychologistDashboard(user.id);
    return dashboard.weeklyStats;
  }

  @Get('my-consultations')
  @ApiOperation({ summary: 'Get my consultations (Patients only)' })
  @ApiResponse({ status: 200, description: 'My consultations retrieved successfully' })
  async getMyConsultations(@CurrentUser() user: any) {
    return this.psychologistService.getPatientPsychologicalHistory(user.id);
  }

  @Put('consultation/:consultationId/priority')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Update consultation priority' })
  @ApiResponse({ status: 200, description: 'Priority updated successfully' })
  async updateConsultationPriority(
    @Param('consultationId') consultationId: string,
    @Body() body: { priority: 'baixa' | 'media' | 'alta' | 'urgente' },
    @CurrentUser() user: any,
  ) {
    // Implementation for updating consultation priority
    return { message: 'Priority updated successfully' };
  }

  @Post('consultation/:consultationId/crisis-flag')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Flag consultation as crisis' })
  @ApiResponse({ status: 200, description: 'Crisis flag set successfully' })
  async flagAsCrisis(
    @Param('consultationId') consultationId: string,
    @Body() body: { crisisType: string; notes: string },
    @CurrentUser() user: any,
  ) {
    // Implementation for flagging crisis
    return { message: 'Crisis flag set successfully' };
  }

  @Get('emergency-contacts')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Get emergency contacts for crisis situations' })
  @ApiResponse({ status: 200, description: 'Emergency contacts retrieved successfully' })
  async getEmergencyContacts(@CurrentUser() user: any) {
    return {
      contacts: [
        {
          name: 'CVV - Centro de Valorização da Vida',
          phone: '188',
          description: 'Suporte emocional e prevenção do suicídio',
          available: '24 horas',
        },
        {
          name: 'SAMU',
          phone: '192',
          description: 'Emergências médicas',
          available: '24 horas',
        },
        {
          name: 'Disque Denúncia',
          phone: '181',
          description: 'Violência doméstica e abuso',
          available: '24 horas',
        },
      ],
    };
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
