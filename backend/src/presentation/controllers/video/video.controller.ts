import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VideoService } from '@/application/services/video.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';

@ApiTags('video')
@Controller('video')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('room/:consultationId')
  @ApiOperation({ summary: 'Create video call room for consultation' })
  @ApiResponse({ status: 201, description: 'Video room created successfully' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async createRoom(
    @Param('consultationId') consultationId: string,
    @CurrentUser() user: any
  ) {
    return this.videoService.createRoom(consultationId);
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get video call room details' })
  @ApiResponse({
    status: 200,
    description: 'Room details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoom(@Param('roomId') roomId: string, @CurrentUser() user: any) {
    return this.videoService.getRoom(roomId);
  }

  @Post('room/:roomId/join')
  @ApiOperation({ summary: 'Join video call room' })
  @ApiResponse({ status: 200, description: 'Joined room successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async joinRoom(
    @Param('roomId') roomId: string,
    @Query('socketId') socketId: string,
    @CurrentUser() user: any
  ) {
    return this.videoService.joinRoom(roomId, socketId, user);
  }

  @Post('room/:roomId/leave')
  @ApiOperation({ summary: 'Leave video call room' })
  @ApiResponse({ status: 200, description: 'Left room successfully' })
  async leaveRoom(@Param('roomId') roomId: string, @CurrentUser() user: any) {
    return this.videoService.leaveRoom(roomId, user);
  }

  @Get('rooms/active')
  @ApiOperation({ summary: 'Get active video rooms for user' })
  @ApiResponse({
    status: 200,
    description: 'Active rooms retrieved successfully',
  })
  async getActiveRooms(@CurrentUser() user: any) {
    return this.videoService.getActiveRooms(user);
  }
}
