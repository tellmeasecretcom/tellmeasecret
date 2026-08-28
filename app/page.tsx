'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { getSessionId } from '@/lib/helpers'
import SecretForm from '@/components/SecretForm'
import Layout from '@/components/Layout'

export default function HomePage() {
  const [secrets, setSecrets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userReactions, setUserReactions] = useState<Record<string, string>>({})
  const [sessionId, setSessionId] = useState('')

  // Session-ID im Browser generieren
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = getSessionId()
      setSessionId(id)
    }
  }, [])

  // Initiale Daten laden
  useEffect(() => {
    if (sessionId) {
      loadSecrets()
    }
  }, [sessionId])

  // 🔄 Echtzeit-Listener für Secrets (mit Verzögerung)
  useEffect(() => {
    if (!sessionId) return

    let timeoutId: NodeJS.Timeout

    const channel = supabase
      .channel('secrets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'secrets',
        },
        () => {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            loadSecrets()
          }, 2000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(timeoutId)
    }
  }, [sessionId])

  const loadSecrets = async () => {
    if (!sessionId) return
    setLoading(true)

    const { data } = await supabase
      .from('secrets')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    setSecrets(data || [])

    if (data && data.length > 0) {
      const { data: reactions } = await supabase
        .from('secret_reactions')
        .select('secret_id, reaction_type')
        .eq('session_id', sessionId)
        .in('secret_id', data.map((s) => s.id))

      const reactionMap: Record<string, string> = {}
      reactions?.forEach((r) => {
        reactionMap[r.secret_id] = r.reaction_type
      })
      setUserReactions(reactionMap)
    }
    setLoading(false)
  }

  const handleReaction = async (secretId: string, reactionType: 'krass' | 'lustig') => {
    if (!sessionId) return

    try {
      const response = await fetch('/api/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretId, reactionType, sessionId }),
      })

      if (response.ok) {
        // Google Analytics Event senden
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'reaction', {
            event_category: 'engagement',
            event_label: reactionType, // 'krass' oder 'lustig'
            value: 1
          })
        }

        const data = await response.json()
        setSecrets((prev) =>
          prev.map((secret) =>
            secret.id === secretId
              ? {
                ...secret,
                reactions_krass: data.reactions?.krass ?? 0,
                reactions_lustig: data.reactions?.lustig ?? 0,
              }
              : secret
          )
        )
        setUserReactions((prev) => {
          const current = prev[secretId]
          if (current === reactionType) {
            const newReactions = { ...prev }
            delete newReactions[secretId]
            return newReactions
          }
          return { ...prev, [secretId]: reactionType }
        })
      }
    } catch {
      console.error('Fehler beim Senden der Reaktion')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-gold rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Lade Geheimnisse...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Hero-Bereich */}
      <div className="relative py-12 mb-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-light/30 to-transparent rounded-3xl -z-10"></div>
        {/* Banner */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-elegant">
          <img src="/banner.jpeg" alt="tellmeasecret – anonyme Geheimnisse teilen" className="w-full h-auto object-cover" />
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <SecretForm />
      </div>

      <div className="mt-12 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-light text-gray-700">Neueste Geheimnisse</h2>
          <span className="text-xs text-gray-400">{secrets.length} Stück</span>
        </div>

        {secrets.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-light">Noch keine Geheimnisse.</p>
            <p className="text-gray-300 text-sm mt-1">Sei der Erste! 🙏</p>
          </div>
        ) : (
          <div className="space-y-4">
            {secrets.map((secret) => (
              <div key={secret.id} className="card-secret shadow-elegant">
                {secret.is_premium ? (
                  <div>
                    <div className="flex items-start justify-between">
                      <p className="text-lg text-gray-600 italic font-light flex-1">
                        {secret.teaser ? secret.teaser.slice(0, 40) + '...' : secret.content.slice(0, 40) + '...'}
                      </p>
                      <button
                        style={{
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          padding: '0.25rem 1rem',
                          borderRadius: '9999px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          whiteSpace: 'nowrap',
                          marginLeft: '0.75rem',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333333')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#000000')}
                        onClick={() => alert('Zahlungsfunktion kommt bald!')}
                      >
                        Freischalten (0,49 €)
                      </button>
                      <span className="bg-gold-light text-gold text-xs px-3 py-1 rounded-full whitespace-nowrap ml-3 flex-shrink-0">
                        ⭐ Premium
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg text-gray-700 font-light leading-relaxed">{secret.content}</p>
                )}

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {new Date(secret.created_at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <span
                      onClick={() => handleReaction(secret.id, 'krass')}
                      className={`text-sm cursor-pointer transition-all ${userReactions[secret.id] === 'krass' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      😲 {secret.reactions_krass || 0}
                    </span>

                    <span className="text-gray-300" style={{ padding: '0 4px' }}>
                      {' '}
                    </span>

                    <span
                      onClick={() => handleReaction(secret.id, 'lustig')}
                      className={`text-sm cursor-pointer transition-all ${userReactions[secret.id] === 'lustig' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      😂 {secret.reactions_lustig || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}