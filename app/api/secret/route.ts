import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// --- Rate Limiting ---
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]
  return '127.0.0.1'
}
function checkRateLimit(ip: string): { allowed: boolean; resetAfter?: number } {
  const now = Date.now()
  const windowMs = 30 * 60 * 1000
  const maxRequests = 2
  const record = rateLimitStore.get(ip)
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }
  if (record.count < maxRequests) {
    record.count += 1
    return { allowed: true }
  }
  return { allowed: false, resetAfter: (record.resetTime - now) / 1000 }
}

// --- Hilfsfunktionen für Textbereinigung & Ähnlichkeit ---
function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9äöüß ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getJaccardSimilarity(text1: string, text2: string): number {
  const words1 = new Set(cleanText(text1).split(' '))
  const words2 = new Set(cleanText(text2).split(' '))
  const intersection = new Set([...words1].filter(word => words2.has(word)))
  const union = new Set([...words1, ...words2])
  return intersection.size / union.size
}

// --- Haupt-API-Funktion ---
export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
/*     const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.resetAfter! / 60)
      return NextResponse.json(
        { error: `Du hast zu viele Secrets gesendet. Bitte warte ${minutes} Minuten.` },
        { status: 429 }
      )
    } */

    const { content, teaser } = await request.json()
    const trimmedContent = content.trim()

    // 2. Validierung
    if (!trimmedContent || trimmedContent.length < 20 || trimmedContent.length > 500) {
      return NextResponse.json(
        { error: 'Dein Geheimnis muss zwischen 20 und 500 Zeichen lang sein.' },
        { status: 400 }
      )
    }

    // 3. Supabase-Client initialisieren
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    // 4. ALLE Secrets laden (kein Status-Filter!)
    const { data: existingSecrets, error: fetchError } = await supabase
      .from('secrets')
      .select('id, content, status')

    if (fetchError) {
      console.error('Fehler beim Laden der Secrets:', fetchError)
      return NextResponse.json(
        { error: 'Datenbankfehler. Bitte versuche es später nochmal.' },
        { status: 500 }
      )
    }

    // 5. Prüfung auf identische Secrets (100% Duplikate) – gegen ALLE
    const exactDuplicate = existingSecrets?.find(
      (secret) => secret.content === trimmedContent
    )
    if (exactDuplicate) {
      return NextResponse.json(
        { error: 'Dieses Geheimnis wurde bereits eingereicht. Bitte teile ein neues mit uns!' },
        { status: 409 }
      )
    }

    // 6. Prüfung auf ähnliche Secrets (Jaccard-Ähnlichkeit) – gegen ALLE
    const similarSecrets = existingSecrets?.filter((secret) => {
      const similarity = getJaccardSimilarity(secret.content, trimmedContent)
      return similarity > 0.7
    })

    // 7. Entscheidung basierend auf Ähnlichkeit
    let newStatus = 'pending'
    let userMessage = 'Dein Geheimnis wurde gesendet und wird nach Prüfung veröffentlicht. 🙏'

    if (similarSecrets && similarSecrets.length > 0) {
      newStatus = 'pending_review'
      userMessage = 'Dein Geheimnis wurde gesendet. Wir prüfen es manuell, da es Ähnlichkeiten mit anderen Secrets gibt. 🙏'

      // Alte Secrets auf 'pending_review' setzen
      const similarIds = similarSecrets.map((s) => s.id)
      const { error: updateError } = await supabase
        .from('secrets')
        .update({ status: 'pending_review' })
        .in('id', similarIds)

      if (updateError) {
        console.error('Fehler beim Aktualisieren ähnlicher Secrets:', updateError)
      }
    }

    // 8. Neues Secret speichern
    const { error: insertError } = await supabase.from('secrets').insert({
      content: trimmedContent,
      teaser: teaser || trimmedContent.slice(0, 80) + '...',
      status: newStatus,
    })

    if (insertError) {
      console.error('Fehler beim Speichern des Secrets:', insertError)
      return NextResponse.json(
        { error: 'Fehler beim Speichern. Bitte versuche es später nochmal.' },
        { status: 500 }
      )
    }

    // 9. Erfolgsmeldung
    return NextResponse.json({
      success: true,
      message: userMessage,
    })
  } catch (error) {
    console.error('Server-Fehler:', error)
    return NextResponse.json(
      { error: 'Server-Fehler. Bitte versuche es später nochmal.' },
      { status: 500 }
    )
  }
}