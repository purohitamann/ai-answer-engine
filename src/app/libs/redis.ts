// // lib/redis.ts
// import { createClient, RedisClientType } from 'redis';

// let redisClient: RedisClientType | null = null;

// export async function getRedisClient(): Promise<RedisClientType> {
//   if (redisClient && redisClient.isOpen) {
//     return redisClient;
//   }

//   redisClient = createClient({
//     url: process.env.REDIS_URL,
//   });

//   redisClient.on('error', (err) => {
//     console.error('Redis Client Error', err);
//   });

//   await redisClient.connect();

//   return redisClient;
// }

// // Optionally, you can export a default client if you prefer:
// // (Make sure you call getRedisClient() somewhere on startup)
// export default getRedisClient;
// lib/redis.ts
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export default redis;
