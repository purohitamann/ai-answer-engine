import { NextResponse } from 'next/server'
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a Redis instance using Upstash credentials
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});


const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "myroute", 
});

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  
  // Apply rate limiting only on a specific route, for example: /api/chjt
  if (pathname.startsWith("/api/chat")) {
    // Identify the user (e.g., by IP)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const result = await ratelimit.limit(ip);
    console.log("Rate limit remaining:", result.remaining);
    // Check the rate limit
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      
      // Return a 429 response if limit is exceeded
      return new NextResponse(`Too many requests: Rate limit exceeded!! `, {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }

    // If within limits, add rate limit headers and continue
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());
    return response;
  }

  // If it's not the route we're rate-limiting, just continue
  return NextResponse.next();
}
export const config = {
  matcher: ['/api/chat/:path*'],
};
