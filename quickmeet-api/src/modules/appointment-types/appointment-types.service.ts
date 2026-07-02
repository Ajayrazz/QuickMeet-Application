import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentTypeDto, UpdateAppointmentTypeDto } from './dto/appointment-type.dto';
import { ForbiddenResourceException } from '../../common/exceptions/domain.exceptions';

@Injectable()
export class AppointmentTypesService {
  constructor(private prisma: PrismaService) {}

  async create(adminId: string, dto: CreateAppointmentTypeDto) {
    return this.prisma.appointmentType.create({
      data: {
        ...dto,
        adminId,
      },
    });
  }

  async update(adminId: string, id: string, dto: UpdateAppointmentTypeDto) {
    const aptType = await this.prisma.appointmentType.findUnique({ where: { id } });
    if (!aptType) throw new NotFoundException('Appointment type not found');
    if (aptType.adminId !== adminId) throw new ForbiddenResourceException();

    return this.prisma.appointmentType.update({
      where: { id },
      data: dto,
    });
  }

  async findAll(search?: string, category?: string, page: number = 1, limit: number = 10) {
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = category;
    }

    const [data, total] = await Promise.all([
      this.prisma.appointmentType.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.appointmentType.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const aptType = await this.prisma.appointmentType.findUnique({ where: { id } });
    if (!aptType) throw new NotFoundException('Appointment type not found');
    return aptType;
  }
}
