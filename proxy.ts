import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Nur die Admin-Seite schützen – API-Routen überspringen!
  const path = request.nextUrl.pathname

  // Wenn es eine API-Route ist → sofort weiterleiten (nicht blockieren!)
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Wenn es die Admin-Seite ist → Passwort prüfen
  if (path.startsWith('/a4tmas')) {
    const isLoggedIn = request.cookies.get('admin-auth')?.value === 'true'

    if (!isLoggedIn) {
      const loginUrl = new URL('/admin-login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}