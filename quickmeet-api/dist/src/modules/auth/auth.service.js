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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const notification_service_1 = require("../notifications/notification.service");
const hash_util_1 = require("../../common/utils/hash.util");
const domain_exceptions_1 = require("../../common/exceptions/domain.exceptions");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    notificationService;
    constructor(prisma, jwtService, configService, notificationService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.notificationService = notificationService;
    }
    generateRandomToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingUser) {
            throw new domain_exceptions_1.UserAlreadyExistsException();
        }
        const passwordHash = await (0, hash_util_1.hashString)(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
            },
        });
        const verifyTokenRaw = this.generateRandomToken();
        const tokenHash = await (0, hash_util_1.hashString)(verifyTokenRaw);
        await this.prisma.verificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                type: 'EMAIL_VERIFY',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        await this.notificationService.sendVerificationEmail(user.email, `${user.id}:${verifyTokenRaw}`);
        return { message: 'Registration successful. Please check your email to verify.' };
    }
    async verifyEmail(token) {
        const parts = token.split(':');
        if (parts.length !== 2) {
            throw new common_1.BadRequestException('Invalid token format');
        }
        const [userId, rawToken] = parts;
        const vTokens = await this.prisma.verificationToken.findMany({
            where: { userId, type: 'EMAIL_VERIFY', expiresAt: { gt: new Date() } }
        });
        for (const vToken of vTokens) {
            const isValid = await (0, hash_util_1.verifyHash)(vToken.tokenHash, rawToken);
            if (isValid) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { isVerified: true }
                });
                await this.prisma.verificationToken.delete({ where: { id: vToken.id } });
                return { message: 'Email verified successfully.' };
            }
        }
        throw new domain_exceptions_1.TokenExpiredException();
    }
    async login(dto, deviceInfo) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            throw new domain_exceptions_1.InvalidCredentialsException();
        }
        const passwordValid = await (0, hash_util_1.verifyHash)(user.passwordHash, dto.password);
        if (!passwordValid) {
            throw new domain_exceptions_1.InvalidCredentialsException();
        }
        return this.generateTokens(user, deviceInfo);
    }
    async refresh(dto, deviceInfo) {
        const parts = dto.refreshToken.split(':');
        if (parts.length !== 2) {
            throw new common_1.UnauthorizedException('Invalid token format');
        }
        const [userId, rawToken] = parts;
        const activeTokens = await this.prisma.refreshToken.findMany({
            where: { userId, revokedAt: null, expiresAt: { gt: new Date() } }
        });
        for (const t of activeTokens) {
            const isValid = await (0, hash_util_1.verifyHash)(t.tokenHash, rawToken);
            if (isValid) {
                await this.prisma.refreshToken.update({
                    where: { id: t.id },
                    data: { revokedAt: new Date() }
                });
                const user = await this.prisma.user.findUnique({ where: { id: userId } });
                if (!user)
                    throw new common_1.UnauthorizedException('User not found');
                return this.generateTokens(user, deviceInfo);
            }
        }
        throw new domain_exceptions_1.TokenExpiredException();
    }
    async logout(dto) {
        const parts = dto.refreshToken.split(':');
        if (parts.length !== 2)
            return { message: 'Logged out' };
        const [userId, rawToken] = parts;
        const activeTokens = await this.prisma.refreshToken.findMany({
            where: { userId, revokedAt: null }
        });
        for (const t of activeTokens) {
            const isValid = await (0, hash_util_1.verifyHash)(t.tokenHash, rawToken);
            if (isValid) {
                await this.prisma.refreshToken.update({
                    where: { id: t.id },
                    data: { revokedAt: new Date() }
                });
                break;
            }
        }
        return { message: 'Logged out successfully' };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            return { message: 'If the email exists, a reset link will be sent.' };
        const resetTokenRaw = this.generateRandomToken();
        const tokenHash = await (0, hash_util_1.hashString)(resetTokenRaw);
        await this.prisma.verificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                type: 'PASSWORD_RESET',
                expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
            }
        });
        await this.notificationService.sendPasswordResetEmail(user.email, `${user.id}:${resetTokenRaw}`);
        return { message: 'If the email exists, a reset link will be sent.' };
    }
    async resetPassword(dto) {
        const parts = dto.token.split(':');
        if (parts.length !== 2)
            throw new common_1.BadRequestException('Invalid token format');
        const [userId, rawToken] = parts;
        const vTokens = await this.prisma.verificationToken.findMany({
            where: { userId, type: 'PASSWORD_RESET', expiresAt: { gt: new Date() } }
        });
        for (const vToken of vTokens) {
            const isValid = await (0, hash_util_1.verifyHash)(vToken.tokenHash, rawToken);
            if (isValid) {
                const passwordHash = await (0, hash_util_1.hashString)(dto.newPassword);
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { passwordHash }
                });
                await this.prisma.verificationToken.deleteMany({
                    where: { userId, type: 'PASSWORD_RESET' }
                });
                return { message: 'Password reset successfully' };
            }
        }
        throw new domain_exceptions_1.TokenExpiredException();
    }
    async generateTokens(user, deviceInfo) {
        const payload = { sub: user.id, role: user.role, isVerified: user.isVerified };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRY'),
        });
        const rawRefreshToken = this.generateRandomToken();
        const tokenHash = await (0, hash_util_1.hashString)(rawRefreshToken);
        const refreshExpiryStr = this.configService.get('JWT_REFRESH_EXPIRY') || '7d';
        const days = parseInt(refreshExpiryStr) || 7;
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                deviceInfo,
                expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
            }
        });
        return {
            accessToken,
            refreshToken: `${user.id}:${rawRefreshToken}`
        };
    }
    async generateEmailVerificationTokenStr(userId, rawToken) {
        return `${userId}:${rawToken}`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        notification_service_1.NotificationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map