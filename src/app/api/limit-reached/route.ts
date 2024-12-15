import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Configure the Ratelimit instance
// Here, we allow 100 requests per 15 minutes per IP.
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1, "15 m"),
  // Optional: A prefix to differentiate keys, e.g. "myapi"
  prefix: "myapi",
});

export async function GET(request) {
  // Identify the user/IP
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Check the rate limit
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    });
  }

  return new Response("This route is rate-limited, but you're within the limit!", {
    status: 200,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    },
  });
}
