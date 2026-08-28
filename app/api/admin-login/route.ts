import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    // Debug-Log (nur für dich)
    console.log('Empfangenes Passwort:', password)
    
    const adminPassword = process.env.ADMIN_PASSWORD
    console.log('Gespeichertes Passwort:', adminPassword) // Sichere Ausgabe
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Server-Konfigurationsfehler' },
        { status: 500 }
      )
    }
    
    if (password === adminPassword) {
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 300, // <-- 5 Minuten
        path: '/',
        })
      return response
    } else {
      return NextResponse.json(
        { error: 'Falsches Passwort!' },
        { status: 401 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'Server-Fehler' },
      { status: 500 }
    )
  }
}