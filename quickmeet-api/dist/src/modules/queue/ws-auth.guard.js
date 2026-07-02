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
var WsAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const websockets_1 = require("@nestjs/websockets");
const prisma_service_1 = require("../../prisma/prisma.service");
let WsAuthGuard = WsAuthGuard_1 = class WsAuthGuard {
    jwtService;
    configService;
    prisma;
    logger = new common_1.Logger(WsAuthGuard_1.name);
    constructor(jwtService, configService, prisma) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const client = context.switchToWs().getClient();
        const token = this.extractTokenFromHeader(client);
        if (!token) {
            throw new websockets_1.WsException('Unauthorized');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, role: true, isVerified: true },
            });
            if (!user) {
                throw new websockets_1.WsException('Unauthorized');
            }
            client.user = user;
        }
        catch (error) {
            this.logger.error('WebSocket Auth Error', error);
            throw new websockets_1.WsException('Unauthorized');
        }
        return true;
    }
    extractTokenFromHeader(client) {
        const token = client.handshake.auth?.token;
        if (typeof token === 'string') {
            return token;
        }
        return undefined;
    }
};
exports.WsAuthGuard = WsAuthGuard;
exports.WsAuthGuard = WsAuthGuard = WsAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], WsAuthGuard);
//# sourceMappingURL=ws-auth.guard.js.map