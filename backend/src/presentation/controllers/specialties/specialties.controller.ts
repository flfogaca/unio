import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SpecialtiesService } from '@/application/services/specialties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '@/shared/decorators/public.decorator';

@ApiTags('specialties')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all available specialties' })
  @ApiResponse({
    status: 200,
    description: 'Specialties retrieved successfully',
  })
  async findAll() {
    return this.specialtiesService.findAll();
  }

  @Get('wait-times')
  @Public()
  @ApiOperation({ summary: 'Get estimated wait times for each specialty' })
  @ApiResponse({
    status: 200,
    description: 'Wait times retrieved successfully',
  })
  async getWaitTimes() {
    return this.specialtiesService.getWaitTimes();
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get specialty statistics (Authenticated users only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics() {
    return this.specialtiesService.getStatistics();
  }
}
