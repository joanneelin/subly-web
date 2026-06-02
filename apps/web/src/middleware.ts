import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

const AUTH_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/verify-email']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p))
  const isPublic = pathname === '/' || isAuthPath

  // Unauthenticated user trying to access protected route
  if (!user && !isPublic) {
    const next = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/sign-in?next=${next}`, request.url))
  }

  // Authenticated user on sign-in/sign-up → back to landing
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
