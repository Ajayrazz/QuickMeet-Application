"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ExpoPushProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpoPushProvider = void 0;
const common_1 = require("@nestjs/common");
const expo_server_sdk_1 = require("expo-server-sdk");
let ExpoPushProvider = ExpoPushProvider_1 = class ExpoPushProvider {
    expo = new expo_server_sdk_1.Expo();
    logger = new common_1.Logger(ExpoPushProvider_1.name);
    async sendPush(pushToken, title, body, data) {
        if (!expo_server_sdk_1.Expo.isExpoPushToken(pushToken)) {
            this.logger.warn(`Invalid Expo push token: ${pushToken}`);
            return;
        }
        const messages = [{
                to: pushToken,
                sound: 'default',
                title,
                body,
                data: data || {},
            }];
        try {
            const ticketChunks = await this.expo.sendPushNotificationsAsync(messages);
            this.logger.log(`Sent Expo push to ${pushToken}: ${JSON.stringify(ticketChunks)}`);
        }
        catch (error) {
            this.logger.error(`Failed to send Expo push notification to ${pushToken}`, error);
        }
    }
};
exports.ExpoPushProvider = ExpoPushProvider;
exports.ExpoPushProvider = ExpoPushProvider = ExpoPushProvider_1 = __decorate([
    (0, common_1.Injectable)()
], ExpoPushProvider);
//# sourceMappingURL=expo-push.provider.js.map