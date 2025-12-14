import Redis from 'ioredis';

// Use REDIS_URL if provided, otherwise default to localhost:6379
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;

export const connection = new Redis({
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null,
});
