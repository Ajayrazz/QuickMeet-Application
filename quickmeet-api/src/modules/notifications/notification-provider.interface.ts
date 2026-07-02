export interface NotificationProvider {
  sendPush(pushToken: string, title: string, body: string, data?: Record<string, any>): Promise<void>;
}
