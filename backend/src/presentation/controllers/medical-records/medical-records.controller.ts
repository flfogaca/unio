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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MedicalRecordsService } from '@/application/services/medical-records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';

@ApiTags('medical-records')
@Controller('medical-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Get medical records based on user role' })
  @ApiResponse({
    status: 200,
    description: 'Medical records retrieved successfully',
  })
  async findAll(@CurrentUser() user: any) {
    return this.medicalRecordsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medical record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Medical record retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Medical record not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.medicalRecordsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create medical record (Professionals only)' })
  @ApiResponse({
    status: 201,
    description: 'Medical record created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body(ValidationPipe) createMedicalRecordDto: any,
    @CurrentUser() user: any
  ) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medical record' })
  @ApiResponse({
    status: 200,
    description: 'Medical record updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Medical record not found' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateMedicalRecordDto: any,
    @CurrentUser() user: any
  ) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto);
  }

  @Patch(':id/share')
  @ApiOperation({ summary: 'Share medical record with another professional' })
  @ApiResponse({
    status: 200,
    description: 'Medical record shared successfully',
  })
  async share(
    @Param('id') id: string,
    @Body('professionalId') professionalId: string,
    @CurrentUser() user: any
  ) {
    return this.medicalRecordsService.share(id, professionalId);
  }

  @Delete(':id/share/:professionalId')
  @ApiOperation({ summary: 'Remove sharing of medical record' })
  @ApiResponse({ status: 200, description: 'Sharing removed successfully' })
  async unshare(
    @Param('id') id: string,
    @Param('professionalId') professionalId: string,
    @CurrentUser() user: any
  ) {
    return this.medicalRecordsService.unshare(id, professionalId);
  }
}
