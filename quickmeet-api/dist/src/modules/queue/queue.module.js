"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const queue_gateway_1 = require("./queue.gateway");
const queue_service_1 = require("./queue.service");
const queue_events_listener_1 = require("./queue-events.listener");
const ws_auth_guard_1 = require("./ws-auth.guard");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({})],
        providers: [queue_gateway_1.QueueGateway, queue_service_1.QueueService, queue_events_listener_1.QueueEventsListener, ws_auth_guard_1.WsAuthGuard],
        exports: [queue_service_1.QueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map