import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
    
    // Beim Zurücksetzen: Status auf 'pending' UND is_premium auf false setzen
    const { error } = await supabase
      .from('secrets')
      .update({ 
        status: 'pending',
        is_premium: false  // <-- Hier die wichtige Änderung!
      })
      .eq('id', id)

    if (error) {
      console.error('Supabase-Fehler:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.redirect(new URL('/a4tmas', request.url))
  } catch (error) {
    console.error('Server-Fehler:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}