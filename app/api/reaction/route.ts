import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { secretId, reactionType, sessionId } = await request.json()
    
    if (!secretId || !reactionType || !sessionId) {
      return NextResponse.json(
        { error: 'Fehlende Parameter' },
        { status: 400 }
      )
    }

    if (!['krass', 'lustig'].includes(reactionType)) {
      return NextResponse.json(
        { error: 'Ungültiger Reaktionstyp' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    // 1. Prüfen, ob der User bereits reagiert hat
    const { data: existing } = await supabase
      .from('secret_reactions')
      .select('reaction_type')
      .eq('secret_id', secretId)
      .eq('session_id', sessionId)
      .maybeSingle()

    // 2. Reaktion verarbeiten
    if (existing?.reaction_type === reactionType) {
      // --- Reaktion löschen (Toggle) ---
      
      // Reaktion aus secret_reactions löschen
      await supabase
        .from('secret_reactions')
        .delete()
        .eq('secret_id', secretId)
        .eq('session_id', sessionId)

      // Zähler in secrets dekrementieren (direktes Update)
      if (reactionType === 'krass') {
        // Aktuellen Wert holen
        const { data: current } = await supabase
          .from('secrets')
          .select('reactions_krass')
          .eq('id', secretId)
          .single()
        
        const newValue = Math.max(0, (current?.reactions_krass || 0) - 1)
        await supabase
          .from('secrets')
          .update({ reactions_krass: newValue })
          .eq('id', secretId)
      } else {
        const { data: current } = await supabase
          .from('secrets')
          .select('reactions_lustig')
          .eq('id', secretId)
          .single()
        
        const newValue = Math.max(0, (current?.reactions_lustig || 0) - 1)
        await supabase
          .from('secrets')
          .update({ reactions_lustig: newValue })
          .eq('id', secretId)
      }
    } else {
      // --- Neue Reaktion hinzufügen oder ersetzen ---
      
      // Wenn andere Reaktion: alte löschen
      if (existing) {
        // Alte Reaktion löschen
        await supabase
          .from('secret_reactions')
          .delete()
          .eq('secret_id', secretId)
          .eq('session_id', sessionId)

        // Alten Zähler dekrementieren
        if (existing.reaction_type === 'krass') {
          const { data: current } = await supabase
            .from('secrets')
            .select('reactions_krass')
            .eq('id', secretId)
            .single()
          
          const newValue = Math.max(0, (current?.reactions_krass || 0) - 1)
          await supabase
            .from('secrets')
            .update({ reactions_krass: newValue })
            .eq('id', secretId)
        } else {
          const { data: current } = await supabase
            .from('secrets')
            .select('reactions_lustig')
            .eq('id', secretId)
            .single()
          
          const newValue = Math.max(0, (current?.reactions_lustig || 0) - 1)
          await supabase
            .from('secrets')
            .update({ reactions_lustig: newValue })
            .eq('id', secretId)
        }
      }

      // Neue Reaktion einfügen
      await supabase
        .from('secret_reactions')
        .insert({ 
          secret_id: secretId, 
          session_id: sessionId, 
          reaction_type: reactionType 
        })

      // Neuen Zähler inkrementieren
      if (reactionType === 'krass') {
        const { data: current } = await supabase
          .from('secrets')
          .select('reactions_krass')
          .eq('id', secretId)
          .single()
        
        const newValue = (current?.reactions_krass || 0) + 1
        await supabase
          .from('secrets')
          .update({ reactions_krass: newValue })
          .eq('id', secretId)
      } else {
        const { data: current } = await supabase
          .from('secrets')
          .select('reactions_lustig')
          .eq('id', secretId)
          .single()
        
        const newValue = (current?.reactions_lustig || 0) + 1
        await supabase
          .from('secrets')
          .update({ reactions_lustig: newValue })
          .eq('id', secretId)
      }
    }

    // 3. Aktuelle Zähler abrufen
    const { data: updated } = await supabase
      .from('secrets')
      .select('reactions_krass, reactions_lustig')
      .eq('id', secretId)
      .single()

    return NextResponse.json({ 
      success: true, 
      reactions: { 
        krass: updated?.reactions_krass || 0, 
        lustig: updated?.reactions_lustig || 0 
      }
    })
  } catch (error) {
    console.error('Fehler in der Reaction-API:', error)
    return NextResponse.json(
      { error: 'Server-Fehler: ' + (error as Error).message },
      { status: 500 }
    )
  }
}