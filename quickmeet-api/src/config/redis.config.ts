import { RedisOptions } from 'ioredis';

export function getRedisOptions(): RedisOptions {
  return {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    family: 4, // Force IPv4 to prevent ECONNRESET on Render
    keepAlive: 10000,
    retryStrategy(times) {
      // Exponential backoff capped at 3000ms
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true; // Force reconnect
      }
      return false;
    },
  };
}
