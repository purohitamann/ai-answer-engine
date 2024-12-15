// lib/redis.ts
import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL
})

redisClient.on('error', (err) => console.error('Redis Client Error', err))

// Ensure the client connects on startup
async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect()
  }
}

connectRedis()

export default redisClient
