'use client'

import '@/app/globals.css'   // ← DAS IST WICHTIG!
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { formatDate, formatTime } from '@/lib/helpers'
import ExpandableText from '@/components/ExpandableText'

export default function AdminPage() {
  const router = useRouter()
  const [allSecrets, setAllSecrets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'pending_review' | 'approved' | 'rejected'>('all')
  const [timeLeft, setTimeLeft] = useState(1800)

  // Initiale Daten laden
  useEffect(() => {
    loadSecrets()
  }, [])

  // Timer für automatische Weiterleitung
  useEffect(() => {
    if (timeLeft <= 0) {
      document.cookie = 'admin-auth=; path=/; max-age=0'
      router.push('/admin-login')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, router])

  // 🔄 Echtzeit-Listener für Admin-Seite
  useEffect(() => {
    const channel = supabase
      .channel('admin-secrets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'secrets',
        },
        () => {
          loadSecrets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadSecrets = async () => {
    setLoading(true)
    const { data } = await supabase.from('secrets').select('*').order('created_at', { ascending: false })
    setAllSecrets(data || [])
    setLoading(false)
  }

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'reset') => {
    try {
      const response = await fetch(`/api/admin/${action}/${id}`, { method: 'POST' })
      if (response.ok) {
        loadSecrets()
      } else {
        const errorData = await response.json()
        alert(`Fehler: ${errorData.error || 'Unbekannter Fehler'}`)
      }
    } catch {
      alert('Netzwerkfehler – bitte versuche es später nochmal.')
    }
  }

  const togglePremium = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/toggle-premium/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPremium: !currentStatus }),
      })
      if (response.ok) {
        loadSecrets()
      } else {
        const errorData = await response.json()
        alert(`Fehler: ${errorData.error || 'Unbekannter Fehler'}`)
      }
    } catch {
      alert('Netzwerkfehler – bitte versuche es später nochmal.')
    }
  }

  const getFilteredSecrets = () => {
    if (activeTab === 'all') return allSecrets
    return allSecrets.filter((s) => s.status === activeTab)
  }

  const stats = {
    total: allSecrets.length,
    pending: allSecrets.filter((s) => s.status === 'pending').length,
    pending_review: allSecrets.filter((s) => s.status === 'pending_review').length,
    approved: allSecrets.filter((s) => s.status === 'approved').length,
    rejected: allSecrets.filter((s) => s.status === 'rejected').length,
  }

  const filteredSecrets = getFilteredSecrets()

  const getTabClass = (tab: string) => {
    const base = 'admin-tab'
    const activeClass = activeTab === tab ? 'active' : ''
    const typeMap: Record<string, string> = {
      all: 'tab-all',
      pending: 'tab-pending',
      pending_review: 'tab-review',
      approved: 'tab-approved',
      rejected: 'tab-rejected',
    }
    return `${base} ${typeMap[tab] || ''} ${activeClass}`
  }

  if (loading) {
    return <div className="admin-container">Lade Secrets...</div>
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>Live Admin - Geheimnisse verwalten</h1>
        <button className="admin-btn-logout" onClick={() => {
          document.cookie = 'admin-auth=; path=/; max-age=0'
          window.location.href = '/admin-login'
        }}>
          🚪 Abmelden
        </button>
      </div>

      {/* Timer */}
      <div className="admin-timer">
        <p>⏱️ Automatische Weiterleitung in <span className="timer-count">{formatTime(timeLeft)}</span> Minuten</p>
        <p className="timer-hint">Die Seite wird automatisch zur Login-Seite weitergeleitet, wenn der Timer abläuft.</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <div className={getTabClass('all')} onClick={() => setActiveTab('all')}>
          <div className="tab-number">{stats.total}</div>
          <div className="tab-label">Alle</div>
        </div>
        <div className={getTabClass('pending')} onClick={() => setActiveTab('pending')}>
          <div className="tab-number">{stats.pending}</div>
          <div className="tab-label">Ausstehend</div>
        </div>
        <div className={getTabClass('pending_review')} onClick={() => setActiveTab('pending_review')}>
          <div className="tab-number">{stats.pending_review}</div>
          <div className="tab-label">Zu prüfen</div>
        </div>
        <div className={getTabClass('approved')} onClick={() => setActiveTab('approved')}>
          <div className="tab-number">{stats.approved}</div>
          <div className="tab-label">Genehmigt</div>
        </div>
        <div className={getTabClass('rejected')} onClick={() => setActiveTab('rejected')}>
          <div className="tab-number">{stats.rejected}</div>
          <div className="tab-label">Abgelehnt</div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="admin-table-wrapper">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Inhalt</th>
                <th>Status</th>
                <th>Erstellt am</th>
                <th>Bearbeitet am</th>
                <th>Premium</th>
                <th>Reaktionen</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredSecrets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#6b7280' }}>
                    Keine Secrets in dieser Kategorie.
                  </td>
                </tr>
              ) : (
                filteredSecrets.map((secret) => (
                  <tr key={secret.id}>
                    <td style={{ maxWidth: '12rem' }}>
                      <ExpandableText text={secret.content} maxLength={80} />
                    </td>
                    <td>
                      <span
                        className={`status-badge ${secret.status === 'pending'
                          ? 'status-pending'
                          : secret.status === 'pending_review'
                            ? 'status-review'
                            : secret.status === 'approved'
                              ? 'status-approved'
                              : 'status-rejected'
                          }`}
                      >
                        {secret.status === 'pending'
                          ? 'Ausstehend'
                          : secret.status === 'pending_review'
                            ? 'Zu prüfen'
                            : secret.status === 'approved'
                              ? 'Genehmigt'
                              : 'Abgelehnt'}
                      </span>
                    </td>
                    <td>{formatDate(secret.created_at)}</td>
                    <td>
                      {secret.status === 'pending' || secret.status === 'pending_review' ? (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      ) : (
                        formatDate(secret.updated_at)
                      )}
                    </td>
                    <td>
                      {secret.status === 'approved' ? (
                        <button
                          onClick={() => togglePremium(secret.id, secret.is_premium || false)}
                          className={`premium-toggle ${secret.is_premium ? 'is-premium' : 'is-standard'}`}
                        >
                          <span className="star">{secret.is_premium ? '⭐' : '☆'}</span>
                          {secret.is_premium ? 'Premium' : 'Standard'}
                        </button>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td className="reactions-cell">
                      <span>😲 {secret.reactions_krass || 0}</span>
                      <span>😂 {secret.reactions_lustig || 0}</span>
                    </td>
                    <td>
                      {secret.status === 'pending' || secret.status === 'pending_review' ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <button className="admin-btn admin-btn-approve" onClick={() => handleAction(secret.id, 'approve')}>
                            ✅ Freigeben
                          </button>
                          <button className="admin-btn admin-btn-reject" onClick={() => handleAction(secret.id, 'reject')}>
                            ❌ Ablehnen
                          </button>
                        </div>
                      ) : (
                        <button className="admin-btn admin-btn-reset" onClick={() => handleAction(secret.id, 'reset')}>
                          🔄 Zurücksetzen
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}