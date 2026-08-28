import { supabase } from '@/lib/supabase-client'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('secrets')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) {
      console.error('Supabase-Fehler:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // NACH ERFOLGREICHER AKTION ZURÜCK INS ADMIN-PANEL
    return NextResponse.redirect(new URL('/a4tmas', request.url))
  } catch (error) {
    console.error('Server-Fehler:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}