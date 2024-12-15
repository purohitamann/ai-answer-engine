// lib/cache.ts
import redisClient from './redis'

export async function getCache(key: string) {
  const data = await redisClient.get(key)
  return data ? JSON.parse(data) : null
}

export async function setCache(key: string, value: unknown, ttl = 3600) {
  await redisClient.set(key, JSON.stringify(value), { EX: ttl })
}

export async function delCache(key: string) {
  await redisClient.del(key)
}
