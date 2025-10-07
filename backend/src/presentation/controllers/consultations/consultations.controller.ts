import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConsultationsService } from '@/application/services/consultations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { RequireSpecialty } from '@/shared/decorators/specialty.decorator';
import { UserRole, Specialty } from '@/shared/types';
import { SpecialtyFilterService } from '@/shared/services/specialty-filter.service';

@ApiTags('consultations')
@Controller('consultations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsultationsController {
  constructor(
    private readonly consultationsService: ConsultationsService,
    private readonly specialtyFilterService: SpecialtyFilterService,
  ) {}

  @Post()
  @Roles(UserRole.paciente)
  @ApiOperation({ summary: 'Create new consultation (Patients only)' })
  @ApiResponse({ status: 201, description: 'Consultation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body(ValidationPipe) createConsultationDto: any,
    @CurrentUser() user: any,
  ) {
    return this.consultationsService.create({
      ...createConsultationDto,
      patientId: user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get consultations based on user role' })
  @ApiResponse({ status: 200, description: 'Consultations retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'specialty', required: false, enum: Specialty })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('specialty') specialty?: Specialty,
  ) {
    return this.consultationsService.findAll({
      page,
      limit,
      status,
      specialty,
      userId: user.id,
      userRole: user.role,
    });
  }

  @Get('queue/:specialty')
  @RequireSpecialty(Specialty.psicologo, [UserRole.psicologo, UserRole.admin])
  @ApiOperation({ summary: 'Get consultation queue for specialty' })
  @ApiResponse({ status: 200, description: 'Queue retrieved successfully' })
  async getQueue(
    @Param('specialty') specialty: Specialty,
    @CurrentUser() user: any,
  ) {
    // Additional specialty validation
    if (!this.specialtyFilterService.canAccessSpecialty(user.role, specialty)) {
      throw new Error('Access denied for this specialty');
    }
    
    return this.consultationsService.getQueue(specialty);
  }

  @Get('my-queue')
  @Roles(UserRole.paciente)
  @ApiOperation({ summary: 'Get my consultation queue (Patients only)' })
  @ApiResponse({ status: 200, description: 'My queue retrieved successfully' })
  async getMyQueue(@CurrentUser() user: any, @Query('specialty') specialty: Specialty) {
    return this.consultationsService.getMyQueue(user.id, specialty);
  }

  @Get('professional-queue')
  @Roles(UserRole.dentista, UserRole.psicologo, UserRole.medico)
  @ApiOperation({ summary: 'Get professional queue (Professionals only)' })
  @ApiResponse({ status: 200, description: 'Professional queue retrieved successfully' })
  async getProfessionalQueue(@CurrentUser() user: any) {
    // Get specialty based on user role
    const specialty = this.specialtyFilterService.getUserSpecialty(user.role);
    
    if (!specialty) {
      throw new Error('Invalid professional role');
    }
    
    return this.consultationsService.getProfessionalQueue(user.id, specialty);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consultation by ID' })
  @ApiResponse({ status: 200, description: 'Consultation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.consultationsService.findOne(id);
  }

  @Patch(':id/assume')
  @Roles(UserRole.dentista, UserRole.psicologo, UserRole.medico)
  @ApiOperation({ summary: 'Assume consultation (Professionals only)' })
  @ApiResponse({ status: 200, description: 'Consultation assumed successfully' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  @ApiResponse({ status: 400, description: 'Cannot assume this consultation' })
  async assume(@Param('id') id: string, @CurrentUser() user: any) {
    // Verificar se a consulta é da especialidade do profissional
    const consultation = await this.consultationsService.findOne(id);
    const userSpecialty = this.specialtyFilterService.getUserSpecialty(user.role);
    
    if (userSpecialty && consultation.specialty !== userSpecialty) {
      throw new Error('Você só pode assumir consultas da sua especialidade');
    }
    
    return this.consultationsService.assume(id, user.id);
  }

  @Patch(':id/start')
  @Roles(UserRole.dentista, UserRole.psicologo, UserRole.medico)
  @ApiOperation({ summary: 'Start consultation (Professionals only)' })
  @ApiResponse({ status: 200, description: 'Consultation started successfully' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  @ApiResponse({ status: 400, description: 'Cannot start this consultation' })
  async start(@Param('id') id: string, @CurrentUser() user: any) {
    // Verificar se a consulta é da especialidade do profissional
    const consultation = await this.consultationsService.findOne(id);
    const userSpecialty = this.specialtyFilterService.getUserSpecialty(user.role);
    
    if (userSpecialty && consultation.specialty !== userSpecialty) {
      throw new Error('Você só pode iniciar consultas da sua especialidade');
    }
    
    return this.consultationsService.start(id);
  }

  @Patch(':id/finish')
  @Roles(UserRole.dentista, UserRole.psicologo, UserRole.medico)
  @ApiOperation({ summary: 'Finish consultation (Professionals only)' })
  @ApiResponse({ status: 200, description: 'Consultation finished successfully' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  @ApiResponse({ status: 400, description: 'Cannot finish this consultation' })
  async finish(
    @Param('id') id: string,
    @Body(ValidationPipe) finishData: any,
    @CurrentUser() user: any,
  ) {
    // Verificar se a consulta é da especialidade do profissional
    const consultation = await this.consultationsService.findOne(id);
    const userSpecialty = this.specialtyFilterService.getUserSpecialty(user.role);
    
    if (userSpecialty && consultation.specialty !== userSpecialty) {
      throw new Error('Você só pode finalizar consultas da sua especialidade');
    }
    
    return this.consultationsService.finish(id, finishData.notes);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel consultation' })
  @ApiResponse({ status: 200, description: 'Consultation cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel this consultation' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.consultationsService.cancel(id, reason);
  }

  @Get('statistics/queue')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get queue statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getQueueStatistics(@CurrentUser() user: any) {
    return this.consultationsService.getQueueStatistics();
  }

  @Get('statistics/performance')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get performance statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getPerformanceStatistics(@CurrentUser() user: any) {
    return this.consultationsService.getPerformanceStatistics();
  }
}
