"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = require("ioredis");
const config_1 = require("@nestjs/config");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    app;
    adapterConstructor;
    constructor(app) {
        super(app);
        this.app = app;
    }
    async connectToRedis() {
        const configService = this.app.get(config_1.ConfigService);
        const redisUrl = configService.get('REDIS_URL') || 'redis://localhost:6379';
        const pubClient = new ioredis_1.Redis(redisUrl);
        const subClient = pubClient.duplicate();
        await Promise.all([
            new Promise((resolve) => pubClient.on('connect', resolve)),
            new Promise((resolve) => subClient.on('connect', resolve)),
        ]);
        this.adapterConstructor = (0, redis_adapter_1.createAdapter)(pubClient, subClient);
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        if (this.adapterConstructor) {
            server.adapter(this.adapterConstructor);
        }
        return server;
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
//# sourceMappingURL=redis-io.adapter.js.map