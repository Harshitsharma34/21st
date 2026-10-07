import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/travel")) {
    const response = NextResponse.next()
    response.headers.set("x-travel-prototype", "1")
    return response
  }

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next()
  }

  return clerkMiddleware()(request, {} as never)
}

export const config = {
  matcher: [
    "/travel/:path*",
    "/((?!_next|travel(?:/|$)|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
