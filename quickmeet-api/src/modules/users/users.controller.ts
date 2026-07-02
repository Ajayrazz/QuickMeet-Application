import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class UpdatePushTokenDto {
  @IsString()
  pushToken!: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('me/push-token')
  @UseGuards(JwtAuthGuard)
  async updatePushToken(@CurrentUser() user: any, @Body() dto: UpdatePushTokenDto) {
    if (!dto.pushToken) {
      throw new BadRequestException('Push token is required');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { pushToken: dto.pushToken },
    });

    return { message: 'Push token updated successfully' };
  }
}
