"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConsoleNotificationProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleNotificationProvider = void 0;
const common_1 = require("@nestjs/common");
let ConsoleNotificationProvider = ConsoleNotificationProvider_1 = class ConsoleNotificationProvider {
    logger = new common_1.Logger(ConsoleNotificationProvider_1.name);
    async sendPush(pushToken, title, body, data) {
        this.logger.log(`[PUSH SIMULATION to ${pushToken}] Title: "${title}", Body: "${body}", Data: ${JSON.stringify(data)}`);
    }
};
exports.ConsoleNotificationProvider = ConsoleNotificationProvider;
exports.ConsoleNotificationProvider = ConsoleNotificationProvider = ConsoleNotificationProvider_1 = __decorate([
    (0, common_1.Injectable)()
], ConsoleNotificationProvider);
//# sourceMappingURL=console.provider.js.map