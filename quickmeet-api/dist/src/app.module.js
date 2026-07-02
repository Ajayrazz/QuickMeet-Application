"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const env_config_1 = require("./config/env.config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const appointment_types_module_1 = require("./modules/appointment-types/appointment-types.module");
const slots_module_1 = require("./modules/slots/slots.module");
const bookings_module_1 = require("./modules/bookings/bookings.module");
const redis_module_1 = require("./redis/redis.module");
const users_module_1 = require("./modules/users/users.module");
const queue_module_1 = require("./modules/queue/queue.module");
const bullmq_module_1 = require("./jobs/bullmq.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const health_module_1 = require("./health/health.module");
const nestjs_pino_1 = require("nestjs-pino");
const event_emitter_1 = require("@nestjs/event-emitter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                validate: env_config_1.validateEnv,
                isGlobal: true,
            }),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    transport: {
                        target: 'pino-pretty',
                        options: {
                            singleLine: true,
                        },
                    },
                    redact: {
                        paths: [
                            'req.headers.authorization',
                            'req.headers.cookie',
                            'body.password',
                            'body.token',
                            'body.refreshToken',
                            'body.pushToken',
                        ],
                        censor: '[REDACTED]',
                    },
                },
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{
                    name: 'default',
                    ttl: 60000,
                    limit: 100,
                }]),
            prisma_module_1.PrismaModule,
            notifications_module_1.NotificationsModule,
            auth_module_1.AuthModule,
            appointment_types_module_1.AppointmentTypesModule,
            slots_module_1.SlotsModule,
            bookings_module_1.BookingsModule,
            redis_module_1.RedisModule,
            users_module_1.UsersModule,
            queue_module_1.QueueModule,
            bullmq_module_1.JobsModule,
            analytics_module_1.AnalyticsModule,
            health_module_1.HealthModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map