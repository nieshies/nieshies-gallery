import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateMap = new Map<string, number[]>();

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const windowMs = 60_000;
  const max = 60;

  const timestamps = rateMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  recent.push(now);
  rateMap.set(ip, recent);

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
