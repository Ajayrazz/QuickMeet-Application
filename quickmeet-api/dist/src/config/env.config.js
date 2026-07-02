"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    PORT: zod_1.z.string().transform((val) => parseInt(val, 10)).default(3000),
    JWT_ACCESS_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
    JWT_ACCESS_EXPIRY: zod_1.z.string().min(1),
    JWT_REFRESH_EXPIRY: zod_1.z.string().min(1),
});
const validateEnv = (config) => {
    const parsed = exports.envSchema.safeParse(config);
    if (!parsed.success) {
        throw new Error(`Config validation error: ${parsed.error.message}`);
    }
    return parsed.data;
};
exports.validateEnv = validateEnv;
//# sourceMappingURL=env.config.js.map