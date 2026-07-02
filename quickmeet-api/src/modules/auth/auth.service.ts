import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notifications/notification.service';
import { hashString, verifyHash } from '../../common/utils/hash.util';
import {
  InvalidCredentialsException,
  TokenExpiredException,
  UserAlreadyExistsException,
} from '../../common/exceptions/domain.exceptions';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  private generateRandomToken(): string {
    return randomBytes(32).toString('hex');
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    const passwordHash = await hashString(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
      },
    });

    const verifyTokenRaw = this.generateRandomToken();
    const tokenHash = await hashString(verifyTokenRaw);

    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await this.notificationService.sendVerificationEmail(
      user.email,
      `${user.id}:${verifyTokenRaw}`,
    );

    return {
      message: 'Registration successful. Please check your email to verify.',
    };
  }

  async verifyEmail(token: string) {
    // Note: In a real app we'd need to look up by token, but we stored the hash.
    // If the token is passed in query without user context, we must find all valid email tokens and verify.
    // But hashing verification tokens this way without an identifier can be tricky to look up.
    // Let's assume the token itself has the user ID attached e.g. "userId_randomstring", or we can look it up by matching hashes.
    // For simplicity, since the prompt specifies storing the hashed token, we might need a workaround or find all.
    // A better approach is to store it plain in DB for verification tokens since it's short lived, but prompt said "creates a VerificationToken (hashed, 24h expiry)"
    // Let's fetch all non-expired EMAIL_VERIFY tokens and find a match. This is slow. Let's fix this by finding the token if we had a way.
    // Actually, usually reset tokens are sent as `id_token`. Let's assume the token is `userId:randomBytes`.

    const parts = token.split(':');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid token format');
    }
    const [userId, rawToken] = parts;

    const vTokens = await this.prisma.verificationToken.findMany({
      where: { userId, type: 'EMAIL_VERIFY', expiresAt: { gt: new Date() } },
    });

    for (const vToken of vTokens) {
      const isValid = await verifyHash(vToken.tokenHash, rawToken);
      if (isValid) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { isVerified: true },
        });
        await this.prisma.verificationToken.delete({
          where: { id: vToken.id },
        });
        return { message: 'Email verified successfully.' };
      }
    }

    throw new TokenExpiredException();
  }

  async login(dto: LoginDto, deviceInfo?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const passwordValid = await verifyHash(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new InvalidCredentialsException();
    }

    return this.generateTokens(user, deviceInfo);
  }

  async refresh(dto: RefreshDto, deviceInfo?: string) {
    // Again, token is a random string. We need to find the correct refresh token.
    // Typically refresh tokens are also stored hashed. The client should send `tokenId:rawToken` or `userId:rawToken`.
    // Let's assume `userId:rawToken` for refresh tokens as well.
    const parts = dto.refreshToken.split(':');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid token format');
    }
    const [userId, rawToken] = parts;

    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    for (const t of activeTokens) {
      const isValid = await verifyHash(t.tokenHash, rawToken);
      if (isValid) {
        // Rotate token
        await this.prisma.refreshToken.update({
          where: { id: t.id },
          data: { revokedAt: new Date() },
        });

        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user) throw new UnauthorizedException('User not found');
        return this.generateTokens(user, deviceInfo);
      }
    }

    throw new TokenExpiredException();
  }

  async logout(dto: RefreshDto) {
    const parts = dto.refreshToken.split(':');
    if (parts.length !== 2) return { message: 'Logged out' };
    const [userId, rawToken] = parts;

    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });

    for (const t of activeTokens) {
      const isValid = await verifyHash(t.tokenHash, rawToken);
      if (isValid) {
        await this.prisma.refreshToken.update({
          where: { id: t.id },
          data: { revokedAt: new Date() },
        });
        break;
      }
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user)
      return { message: 'If the email exists, a reset link will be sent.' };

    const resetTokenRaw = this.generateRandomToken();
    const tokenHash = await hashString(resetTokenRaw);

    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      },
    });

    await this.notificationService.sendPasswordResetEmail(
      user.email,
      `${user.id}:${resetTokenRaw}`,
    );
    return { message: 'If the email exists, a reset link will be sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const parts = dto.token.split(':');
    if (parts.length !== 2)
      throw new BadRequestException('Invalid token format');
    const [userId, rawToken] = parts;

    const vTokens = await this.prisma.verificationToken.findMany({
      where: { userId, type: 'PASSWORD_RESET', expiresAt: { gt: new Date() } },
    });

    for (const vToken of vTokens) {
      const isValid = await verifyHash(vToken.tokenHash, rawToken);
      if (isValid) {
        const passwordHash = await hashString(dto.newPassword);
        await this.prisma.user.update({
          where: { id: userId },
          data: { passwordHash },
        });
        await this.prisma.verificationToken.deleteMany({
          where: { userId, type: 'PASSWORD_RESET' },
        });
        return { message: 'Password reset successfully' };
      }
    }

    throw new TokenExpiredException();
  }

  private async generateTokens(user: any, deviceInfo?: string) {
    const payload = {
      sub: user.id,
      role: user.role,
      isVerified: user.isVerified,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRY'),
    });

    const rawRefreshToken = this.generateRandomToken();
    const tokenHash = await hashString(rawRefreshToken);

    // Extract days from 7d
    const refreshExpiryStr =
      this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d';
    const days = parseInt(refreshExpiryStr) || 7;

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        deviceInfo,
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken: `${user.id}:${rawRefreshToken}`,
    };
  }

  // To patch the register method to output userId:randomToken
  async generateEmailVerificationTokenStr(userId: string, rawToken: string) {
    return `${userId}:${rawToken}`;
  }
}
