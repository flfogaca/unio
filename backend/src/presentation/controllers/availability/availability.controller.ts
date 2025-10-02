import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from '../../application/services/availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Specialty } from '@/shared/types';

@ApiTags('availability')
@Controller('availability')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('specialty/:specialty')
  @ApiOperation({ summary: 'Check if a specialty is available' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkSpecialtyAvailability(
    @Param('specialty') specialty: Specialty,
    @CurrentUser() user: any,
  ) {
    return this.availabilityService.checkSpecialtyAvailability(specialty);
  }

  @Get('specialties')
  @ApiOperation({ summary: 'Get availability for all specialties' })
  @ApiResponse({ status: 200, description: 'All specialties availability retrieved successfully' })
  async getAllSpecialtiesAvailability(@CurrentUser() user: any) {
    return this.availabilityService.getAllSpecialtiesAvailability();
  }

  @Get('professional')
  @ApiOperation({ summary: 'Get current user professional availability' })
  @ApiResponse({ status: 200, description: 'Professional availability retrieved successfully' })
  async getProfessionalAvailability(@CurrentUser() user: any) {
    return this.availabilityService.getProfessionalAvailability(user.id);
  }

  @Put('professional')
  @ApiOperation({ summary: 'Update professional availability status' })
  @ApiResponse({ status: 200, description: 'Professional availability updated successfully' })
  async updateProfessionalAvailability(
    @Body() body: {
      isOnline: boolean;
      status: 'available' | 'busy' | 'away' | 'offline';
    },
    @CurrentUser() user: any,
  ) {
    return this.availabilityService.updateProfessionalAvailability(
      user.id,
      body.isOnline,
      body.status,
    );
  }

  @Post('specialty/:specialty/24h')
  @ApiOperation({ summary: 'Enable/disable 24/7 availability for a specialty' })
  @ApiResponse({ status: 200, description: '24/7 availability updated successfully' })
  async setSpecialty24hAvailability(
    @Param('specialty') specialty: Specialty,
    @Body() body: { enabled: boolean },
    @CurrentUser() user: any,
  ) {
    return this.availabilityService.setSpecialty24hAvailability(specialty, body.enabled);
  }

  @Get('specialty/:specialty/next-available')
  @ApiOperation({ summary: 'Get next available time for a specialty' })
  @ApiResponse({ status: 200, description: 'Next available time calculated successfully' })
  async getNextAvailableTime(
    @Param('specialty') specialty: Specialty,
    @CurrentUser() user: any,
  ) {
    const nextAvailable = await this.availabilityService.getNextAvailableTime(specialty);
    return {
      specialty,
      nextAvailableTime: nextAvailable,
      isAvailableNow: nextAvailable === null,
    };
  }
}
