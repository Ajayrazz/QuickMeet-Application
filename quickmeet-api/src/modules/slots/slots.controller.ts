import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto, UpdateSlotDto } from './dto/slot.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller()
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post('slots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@CurrentUser() user: any, @Body() dto: CreateSlotDto) {
    return this.slotsService.create(user.id, dto);
  }

  @Patch('slots/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateSlotDto,
  ) {
    return this.slotsService.update(user.id, id, dto);
  }

  @Get('appointment-types/:id/slots')
  async findByAppointmentTypeAndDate(
    @Param('id') appointmentTypeId: string,
    @Query('date') date: string,
  ) {
    return this.slotsService.findByAppointmentTypeAndDate(
      appointmentTypeId,
      date,
    );
  }
}
