import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/booking.dto';
import { QueueService } from '../queue/queue.service';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Role, BookingStatus } from '@prisma/client';

@Controller()
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly queueService: QueueService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    if (!user.isVerified) {
      throw new BadRequestException(
        'You must verify your email before booking.',
      );
    }
    return this.bookingsService.create(user.id, dto);
  }

  @Delete('bookings/:id')
  @UseGuards(JwtAuthGuard)
  async cancel(@CurrentUser() user: any, @Param('id') id: string) {
    const isAdmin = user.role === Role.ADMIN;
    return this.bookingsService.cancel(user.id, id, isAdmin);
  }

  @Patch('bookings/:id/serve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async serve(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.serve(user.id, id);
  }

  @Patch('bookings/:id/no-show')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async noShow(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.noShow(user.id, id);
  }

  @Get('bookings/me')
  @UseGuards(JwtAuthGuard)
  async findMyBookings(
    @CurrentUser() user: any,
    @Query('status') status?: BookingStatus,
    @Query() pagination?: PaginationQueryDto,
  ) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    return this.bookingsService.findMyBookings(user.id, status, page, limit);
  }

  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const isAdmin = user.role === Role.ADMIN;
    return this.bookingsService.findOne(user.id, id, isAdmin);
  }

  @Get('queue/:slotId')
  async getQueueSnapshot(@Param('slotId') slotId: string) {
    return this.queueService.getSnapshot(slotId);
  }
}
