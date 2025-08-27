import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import getOrCreateDB from "./models/server/dbSetup";
import getOrCreateStorage from "./models/server/storageSetup";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only run database setup for API routes and dashboard routes that need it
  if (pathname.startsWith('/dashboard') || (pathname.startsWith('/api') && !pathname.startsWith('/api/health'))) {
    await Promise.all([getOrCreateDB(), getOrCreateStorage()]);
    return NextResponse.next();
  }

  // For public pages, skip database setup entirely to improve performance
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  /* match only specific paths that need database setup:
  - dashboard routes
  - API routes (excluding static/health)
  */
  matcher: [
    "/dashboard/:path*",
    "/api/((?!health|_next/static|_next/image|favicon.ico).*)"
  ],
};
