import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WaitTimeService } from '../../application/services/wait-time.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Specialty } from '@/shared/types';

@ApiTags('wait-time')
@Controller('wait-time')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WaitTimeController {
  constructor(private readonly waitTimeService: WaitTimeService) {}

  @Get('specialty/:specialty')
  @ApiOperation({ summary: 'Get estimated wait time for a specialty' })
  @ApiResponse({ status: 200, description: 'Wait time calculated successfully' })
  async getSpecialtyWaitTime(
    @Param('specialty') specialty: Specialty,
    @CurrentUser() user: any,
  ) {
    return this.waitTimeService.calculateWaitTime(specialty);
  }

  @Get('specialties')
  @ApiOperation({ summary: 'Get wait times for multiple specialties' })
  @ApiResponse({ status: 200, description: 'Wait times calculated successfully' })
  async getSpecialtiesWaitTimes(
    @Query('specialties') specialties: string,
    @CurrentUser() user: any,
  ) {
    const specialtyList = specialties.split(',').filter(Boolean) as Specialty[];
    return this.waitTimeService.getWaitTimesForSpecialties(specialtyList);
  }

  @Get('consultation/:consultationId')
  @ApiOperation({ summary: 'Get wait time for a specific consultation' })
  @ApiResponse({ status: 200, description: 'Consultation wait time calculated successfully' })
  async getConsultationWaitTime(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: any,
  ) {
    return this.waitTimeService.getConsultationWaitTime(consultationId);
  }

  @Get('statistics/:specialty')
  @ApiOperation({ summary: 'Get queue statistics for a specialty' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getQueueStatistics(
    @Param('specialty') specialty: Specialty,
    @CurrentUser() user: any,
  ) {
    return this.waitTimeService.getQueueStatistics(specialty);
  }

  @Get('historical/:specialty')
  @ApiOperation({ summary: 'Get historical wait time data for analytics' })
  @ApiResponse({ status: 200, description: 'Historical data retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 7)' })
  async getHistoricalData(
    @Param('specialty') specialty: Specialty,
    @Query('days') days: string = '7',
    @CurrentUser() user: any,
  ) {
    const daysCount = parseInt(days, 10) || 7;
    return this.waitTimeService.getHistoricalData(specialty, daysCount);
  }
}
