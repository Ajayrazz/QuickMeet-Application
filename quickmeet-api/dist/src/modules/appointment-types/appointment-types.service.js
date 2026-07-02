"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const domain_exceptions_1 = require("../../common/exceptions/domain.exceptions");
let AppointmentTypesService = class AppointmentTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(adminId, dto) {
        return this.prisma.appointmentType.create({
            data: {
                ...dto,
                adminId,
            },
        });
    }
    async update(adminId, id, dto) {
        const aptType = await this.prisma.appointmentType.findUnique({ where: { id } });
        if (!aptType)
            throw new common_1.NotFoundException('Appointment type not found');
        if (aptType.adminId !== adminId)
            throw new domain_exceptions_1.ForbiddenResourceException();
        return this.prisma.appointmentType.update({
            where: { id },
            data: dto,
        });
    }
    async findAll(search, category, page = 1, limit = 10) {
        const where = {};
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
    async findOne(id) {
        const aptType = await this.prisma.appointmentType.findUnique({ where: { id } });
        if (!aptType)
            throw new common_1.NotFoundException('Appointment type not found');
        return aptType;
    }
};
exports.AppointmentTypesService = AppointmentTypesService;
exports.AppointmentTypesService = AppointmentTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppointmentTypesService);
//# sourceMappingURL=appointment-types.service.js.map