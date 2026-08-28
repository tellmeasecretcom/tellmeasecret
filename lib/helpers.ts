// lib/helpers.ts – Wiederverwendbare Helfer-Funktionen

/**
 * Formatiert einen Datums-String für die Anzeige
 * Beispiel: 2026-08-27T14:30:00 → 27.08.2026, 14:30
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Generiert oder holt eine eindeutige Session-ID aus dem LocalStorage
 * Wird für anonyme User-Reaktionen verwendet
 */
export const getSessionId = (): string => {
    if (typeof window === 'undefined') return ''
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
        sessionId = crypto.randomUUID()
        localStorage.setItem('sessionId', sessionId)
    }
    return sessionId
}

/**
 * Bereinigt Text für Ähnlichkeitsprüfungen
 * Entfernt Sonderzeichen, wandelt in Kleinbuchstaben um
 */
export const cleanText = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9äöüß ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Berechnet die Jaccard-Ähnlichkeit zwischen zwei Texten (0-1)
 * 0 = keine Ähnlichkeit, 1 = identisch
 */
export const getJaccardSimilarity = (text1: string, text2: string): number => {
    const words1 = new Set(cleanText(text1).split(' '))
    const words2 = new Set(cleanText(text2).split(' '))

    const intersection = new Set([...words1].filter((word) => words2.has(word)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
}

/**
 * Formatiert Sekunden in MM:SS
 * Wird für den Admin-Timer verwendet
 */
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}