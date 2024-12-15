// // app/api/posts/route.ts
// import { NextResponse } from 'next/server'
// import prisma from '../../libs/prisma'
// import { getCache, setCache } from '../../libs/cache'

// export async function GET() {
//   const cacheKey = 'posts:all'

//   // 1. Attempt to retrieve from cache
//   const cachedData = await getCache(cacheKey)
//   if (cachedData) {
//     return NextResponse.json({ source: 'cache', data: cachedData }, { status: 200 })
//   }

//   // 2. Cache miss: Retrieve from the database
//   const posts = await prisma.post.findMany()

//   // 3. Update the cache
//   await setCache(cacheKey, posts, 3600) // Cache for 1 hour

//   return NextResponse.json({ source: 'db', data: posts }, { status: 200 })
// }
import { NextResponse } from "next/server"
import prisma from "../../libs/prisma"
import { setCache, delCache } from "../../libs/cache"

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing title or content" },
        { status: 400 }
      );
    }

    // Create the post in the database
    const newPost = await prisma.post.create({
      data: { title, content },
    })

    // After creating a new post, invalidate the cache for the posts list
    const cacheKey = "posts:all"
    await delCache(cacheKey)

    // (Optional) You could set or update the cache with the new state of posts:
    // const posts = await prisma.post.findMany()
    // await setCache(cacheKey, posts, 3600)

    return NextResponse.json({ success: true, data: newPost }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"; // Optional: ensures route is treated as dynamic
