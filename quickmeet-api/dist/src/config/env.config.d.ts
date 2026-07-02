import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    PORT: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    JWT_ACCESS_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    JWT_ACCESS_EXPIRY: z.ZodString;
    JWT_REFRESH_EXPIRY: z.ZodString;
}, z.core.$strip>;
export type EnvConfig = z.infer<typeof envSchema>;
export declare const validateEnv: (config: Record<string, unknown>) => {
    DATABASE_URL: string;
    PORT: number;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRY: string;
    JWT_REFRESH_EXPIRY: string;
};
