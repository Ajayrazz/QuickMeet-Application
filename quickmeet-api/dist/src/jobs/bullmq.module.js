"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const reminder_processor_1 = require("./processors/reminder.processor");
const jobs_events_listener_1 = require("./jobs-events.listener");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    connection: {
                        url: configService.get('REDIS_URL') || 'redis://localhost:6379',
                    },
                }),
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'reminders',
            }),
        ],
        providers: [reminder_processor_1.ReminderProcessor, jobs_events_listener_1.JobsEventsListener],
        exports: [bullmq_1.BullModule],
    })
], JobsModule);
//# sourceMappingURL=bullmq.module.js.map