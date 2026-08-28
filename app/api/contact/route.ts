import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Einfaches In-Memory Rate Limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getClientIp(request: Request): string {
  // Vercel setzt die echte IP in 'x-forwarded-for'
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]
  }
  // Fallback für lokale Entwicklung
  return '127.0.0.1'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining?: number; resetAfter?: number } {
  const now = Date.now()
  const windowMs = 30 * 60 * 1000 // 30 Minuten (statt 15)
  const maxRequests = 4 // Maximal 4 Anfragen

  const record = rateLimitStore.get(ip)

  // Wenn keine Aufzeichnung existiert oder das Fenster abgelaufen ist
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { allowed: true, remaining: maxRequests - 1, resetAfter: windowMs / 1000 }
  }

  // Wenn das Limit noch nicht erreicht ist
  if (record.count < maxRequests) {
    record.count += 1
    return { allowed: true, remaining: maxRequests - record.count, resetAfter: (record.resetTime - now) / 1000 }
  }

  // Limit überschritten
  return { allowed: false, resetAfter: (record.resetTime - now) / 1000 }
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting prüfen
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.resetAfter! / 60)
      return NextResponse.json(
        { 
          error: `Zu viele Anfragen. Bitte warte ${minutes} Minute${minutes > 1 ? 'n' : ''}.` 
        },
        { status: 429 }
      )
    }

    const { name, email, message, honeypot } = await request.json()

    // 2. Honeypot-Prüfung (Spam-Falle)
    if (honeypot) {
      return NextResponse.json(
        { error: 'Spam erkannt' },
        { status: 400 }
      )
    }

    // 3. Validierung
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Bitte fülle alle Felder aus.' },
        { status: 400 }
      )
    }

    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' },
        { status: 400 }
      )
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Die Nachricht muss mindestens 10 Zeichen lang sein.' },
        { status: 400 }
      )
    }

    // 4. E-Mail über Strato-Server versenden
    const transporter = nodemailer.createTransport({
      host: 'smtp.strato.de',
      port: 465,
      secure: true,
      auth: {
        user: 'hallo@tellmeasecret.com',
        pass: process.env.STRATO_EMAIL_PASSWORD,
      },
      authMethod: 'PLAIN',
    })

    const mailOptions = {
      from: `"Kontaktformular" <hallo@tellmeasecret.com>`,
      to: 'hallo@tellmeasecret.com',
      replyTo: email,
      subject: `Neue Kontaktanfrage von ${name}`,
      text: `
Name: ${name}
E-Mail: ${email}

Nachricht:
${message}
      `,
      html: `
<h2>Neue Kontaktanfrage</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>E-Mail:</strong> ${email}</p>
<p><strong>Nachricht:</strong></p>
<p>${message.replace(/\n/g, '<br />')}</p>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ 
      success: true, 
      message: 'Vielen Dank! Deine Nachricht wurde gesendet. Wir melden uns in Kürze.' 
    })

  } catch (error) {
    console.error('Server-Fehler:', error)
    return NextResponse.json(
      { error: 'Server-Fehler. Bitte versuche es später nochmal.' },
      { status: 500 }
    )
  }
}