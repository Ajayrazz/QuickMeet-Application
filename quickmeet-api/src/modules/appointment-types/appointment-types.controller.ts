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
import { AppointmentTypesService } from './appointment-types.service';
import {
  CreateAppointmentTypeDto,
  UpdateAppointmentTypeDto,
} from './dto/appointment-type.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('appointment-types')
export class AppointmentTypesController {
  constructor(
    private readonly appointmentTypesService: AppointmentTypesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateAppointmentTypeDto,
  ) {
    return this.appointmentTypesService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentTypeDto,
  ) {
    return this.appointmentTypesService.update(user.id, id, dto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query() pagination?: PaginationQueryDto,
  ) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    return this.appointmentTypesService.findAll(search, category, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appointmentTypesService.findOne(id);
  }
}
