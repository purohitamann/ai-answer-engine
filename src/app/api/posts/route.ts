// app/api/posts/route.ts
import { NextResponse } from 'next/server'
import prisma from '../../libs/prisma'
import { getCache, setCache } from '../../libs/cache'

export async function GET() {
  const cacheKey = 'posts:all'

  // 1. Attempt to retrieve from cache
  const cachedData = await getCache(cacheKey)
  if (cachedData) {
    return NextResponse.json({ source: 'cache', data: cachedData }, { status: 200 })
  }

  // 2. Cache miss: Retrieve from the database
  const posts = await prisma.post.findMany()

  // 3. Update the cache
  await setCache(cacheKey, posts, 3600) // Cache for 1 hour

  return NextResponse.json({ source: 'db', data: posts }, { status: 200 })
}
