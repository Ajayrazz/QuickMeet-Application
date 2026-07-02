import { PrismaService } from '../../prisma/prisma.service';
declare class UpdatePushTokenDto {
    pushToken: string;
}
export declare class UsersController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    updatePushToken(user: any, dto: UpdatePushTokenDto): Promise<{
        message: string;
    }>;
}
export {};
