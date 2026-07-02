import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    this.logger.log(
      `[STUB] Sending verification email to ${email} with token: ${token}`,
    );
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    this.logger.log(
      `[STUB] Sending password reset email to ${email} with token: ${token}`,
    );
  }
}
