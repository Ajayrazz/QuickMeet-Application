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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    provider;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma, provider) {
        this.prisma = prisma;
        this.provider = provider;
    }
    async sendNotification(userId, type, title, body, relatedBookingId) {
        try {
            await this.prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    body,
                    relatedBookingId,
                },
            });
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { pushToken: true },
            });
            if (user && user.pushToken) {
                this.provider
                    .sendPush(user.pushToken, title, body, { type, relatedBookingId })
                    .catch((err) => {
                    this.logger.error('Failed to send push inside promise catch', err);
                });
            }
        }
        catch (error) {
            this.logger.error('Error during sendNotification execution', error);
        }
    }
    async getMyNotifications(userId, page = 1, limit = 20) {
        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async markAsRead(userId, id) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification || notification.userId !== userId) {
            return null;
        }
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('NOTIFICATION_PROVIDER')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map