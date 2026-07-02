import { NotificationProvider } from '../notification-provider.interface';
export declare class ExpoPushProvider implements NotificationProvider {
    private readonly expo;
    private readonly logger;
    sendPush(pushToken: string, title: string, body: string, data?: Record<string, any>): Promise<void>;
}
