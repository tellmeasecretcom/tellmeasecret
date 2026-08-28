import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // NUR die Admin-Seite schützen (nicht die API-Routen!)
  if (request.nextUrl.pathname.startsWith('/a4tmas')) {
    const isLoggedIn = request.cookies.get('admin-auth')?.value === 'true'

    if (!isLoggedIn && !request.nextUrl.pathname.startsWith('/api/')) {
      const loginUrl = new URL('/admin-login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/a4tmas/:path*', '/api/:path*'],
}