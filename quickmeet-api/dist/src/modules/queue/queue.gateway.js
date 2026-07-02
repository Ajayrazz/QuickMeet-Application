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
var QueueGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const ws_auth_guard_1 = require("./ws-auth.guard");
const queue_service_1 = require("./queue.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let QueueGateway = QueueGateway_1 = class QueueGateway {
    queueService;
    prisma;
    wsAuthGuard;
    server;
    logger = new common_1.Logger(QueueGateway_1.name);
    constructor(queueService, prisma, wsAuthGuard) {
        this.queueService = queueService;
        this.prisma = prisma;
        this.wsAuthGuard = wsAuthGuard;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token;
            if (!token)
                throw new Error('No token');
        }
        catch (e) {
            this.logger.warn('Client connection rejected');
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleJoinSlot(client, slotId) {
        const user = client.user;
        const slot = await this.prisma.slot.findUnique({
            where: { id: slotId },
            include: { appointmentType: true },
        });
        if (!slot) {
            client.emit('error', { message: 'Slot not found' });
            return;
        }
        let isAuthorized = false;
        if (user.role === 'ADMIN' && slot.appointmentType.adminId === user.id) {
            isAuthorized = true;
        }
        else {
            const activeBooking = await this.prisma.booking.findFirst({
                where: {
                    slotId,
                    userId: user.id,
                    status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.IN_QUEUE] },
                },
            });
            if (activeBooking)
                isAuthorized = true;
        }
        if (!isAuthorized) {
            client.emit('error', { message: 'Unauthorized to join this slot queue' });
            return;
        }
        const roomName = `slot:${slotId}`;
        await client.join(roomName);
        const personalRoom = `user:${user.id}`;
        await client.join(personalRoom);
        const snapshot = await this.queueService.getSnapshot(slotId);
        client.emit('queue:update', snapshot);
    }
    async handleLeaveSlot(client, slotId) {
        const roomName = `slot:${slotId}`;
        await client.leave(roomName);
    }
};
exports.QueueGateway = QueueGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], QueueGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(ws_auth_guard_1.WsAuthGuard),
    (0, websockets_1.SubscribeMessage)('join:slot'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('slotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], QueueGateway.prototype, "handleJoinSlot", null);
__decorate([
    (0, common_1.UseGuards)(ws_auth_guard_1.WsAuthGuard),
    (0, websockets_1.SubscribeMessage)('leave:slot'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('slotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], QueueGateway.prototype, "handleLeaveSlot", null);
exports.QueueGateway = QueueGateway = QueueGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({ namespace: '/queue', cors: true }),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        prisma_service_1.PrismaService,
        ws_auth_guard_1.WsAuthGuard])
], QueueGateway);
//# sourceMappingURL=queue.gateway.js.map