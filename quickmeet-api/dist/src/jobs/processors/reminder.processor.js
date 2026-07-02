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
var ReminderProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("../../modules/notifications/notifications.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let ReminderProcessor = ReminderProcessor_1 = class ReminderProcessor extends bullmq_1.WorkerHost {
    notificationsService;
    prisma;
    logger = new common_1.Logger(ReminderProcessor_1.name);
    constructor(notificationsService, prisma) {
        super();
        this.notificationsService = notificationsService;
        this.prisma = prisma;
    }
    async process(job) {
        const { bookingId, userId } = job.data;
        this.logger.log(`Processing reminder job ${job.id} for booking ${bookingId}`);
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { slot: { include: { appointmentType: true } } },
        });
        if (!booking ||
            (booking.status !== 'CONFIRMED' && booking.status !== 'IN_QUEUE')) {
            this.logger.warn(`Skipping reminder for booking ${bookingId}: status changed or not found`);
            return;
        }
        const title = 'Upcoming Appointment';
        const body = `Your appointment for ${booking.slot.appointmentType.title} is coming up soon!`;
        await this.notificationsService.sendNotification(userId, 'REMINDER', title, body, bookingId);
        return { success: true };
    }
};
exports.ReminderProcessor = ReminderProcessor;
exports.ReminderProcessor = ReminderProcessor = ReminderProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('reminders'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        prisma_service_1.PrismaService])
], ReminderProcessor);
//# sourceMappingURL=reminder.processor.js.map