import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // NUR die Admin-Seite schützen – API-Routen komplett ignorieren!
  if (request.nextUrl.pathname.startsWith('/a4tmas')) {
    const isLoggedIn = request.cookies.get('admin-auth')?.value === 'true'

    if (!isLoggedIn) {
      const loginUrl = new URL('/admin-login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/a4tmas/:path*'],
}