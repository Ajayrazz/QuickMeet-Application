import Redis, { RedisOptions } from 'ioredis';
import { Logger } from '@nestjs/common';

const logger = new Logger('RedisClient');

export function getRedisOptions(url: string): RedisOptions {
  const isTls = url.startsWith('rediss://') || url.includes('upstash.io');
  
  return {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    family: 4,
    keepAlive: 10000,
    tls: isTls ? { rejectUnauthorized: false } : undefined,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  };
}

/**
 * Creates a new Redis instance with robust configuration and mandatory error
 * listeners to prevent unhandled stream errors from crashing the Node.js process.
 */
export function createRedisClient(url: string, name: string = 'Redis'): Redis {
  const client = new Redis(url, getRedisOptions(url));

  // CRITICAL: Without this generic error listener, any socket error (ECONNRESET, EPIPE)
  // emitted by ioredis will be treated as an Uncaught Exception and crash Node.js.
  client.on('error', (err) => {
    logger.error(`[${name}] Connection error: ${err.message}`);
  });

  return client;
}
