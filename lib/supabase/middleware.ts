import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Allow access to auth pages without authentication
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // For all other pages, just pass through - let the layout handle auth checks
  return NextResponse.next()
}
