const Redis = require('ioredis');

const redis = new Redis(process.env.SERVICE_URI_REDIS, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  tls: process.env.SERVICE_URI_REDIS?.startsWith('rediss://') ? {} : undefined,
});

redis.on('connect', () => console.log('✅ Redis connected!'));
redis.on('error', (err) => console.error('❌ Redis error:', err));
redis.on('reconnecting', () => console.log('♻️ Redis reconnecting...'));

module.exports = redis;
