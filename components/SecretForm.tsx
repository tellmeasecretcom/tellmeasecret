'use client'

import { useState } from 'react'
import { MIN_SECRET_LENGTH, MAX_SECRET_LENGTH } from '@/lib/constants'

export default function SecretForm() {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        const trimmedContent = content.trim()
        const charCount = trimmedContent.length

        if (charCount < MIN_SECRET_LENGTH) {
            setError(`Dein Geheimnis ist zu kurz (${charCount} Zeichen). Bitte schreibe mindestens ${MIN_SECRET_LENGTH} Zeichen.`)
            setLoading(false)
            return
        }

        if (charCount > MAX_SECRET_LENGTH) {
            setError(`Dein Geheimnis ist zu lang (${charCount} Zeichen). Bitte kürze es auf maximal ${MAX_SECRET_LENGTH} Zeichen.`)
            setLoading(false)
            return
        }

        const teaser = trimmedContent.slice(0, 80) + '...'

        try {
            const response = await fetch('/api/secret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: trimmedContent, teaser }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                setContent('')
            } else {
                setError(data.error || 'Fehler beim Senden')
            }
        } catch {
            setError('Netzwerkfehler. Bitte versuche es später nochmal.')
        } finally {
            setLoading(false)
        }
    }

    const remainingChars = MAX_SECRET_LENGTH - content.length
    const isOverLimit = remainingChars < 0
    const isValid = content.length >= MIN_SECRET_LENGTH && !isOverLimit && !loading

    return (
        <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-gray-800 leading-tight" style={{ marginBottom: '4px' }}>
                tellmeasecret – Dein anonymes{' '}
                <span className="font-semibold" style={{ color: '#d2901f' }}> Geheimnis</span> teilen
            </h1>
            <h2 className="text-xl font-serif font-light text-gray-700" style={{ marginTop: '2px' }}>
                ohne Urteil, nur deine Geschichte.
            </h2>
            <p className="text-gray-500 text-sm mb-4">
                Jeden Tag neue anonyme Geheimnisse – von Menschen wie dir.
            </p>
            <p className="text-sm text-gray-400 mb-5 font-light">
                Mindestens <span className="text-gray-500">{MIN_SECRET_LENGTH}</span>, maximal{' '}
                <span className="text-gray-500">{MAX_SECRET_LENGTH}</span> Zeichen.
            </p>

            {success && (
                <div className="bg-gray-50 text-gray-700 p-4 rounded mb-4 flex justify-between items-center border border-gray-100">
                    <span className="text-sm">🙏 Danke! Dein Geheimnis wird nach Prüfung veröffentlicht.</span>
                    <button
                        onClick={() => setSuccess(false)}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-4"
                    >
                        ✕
                    </button>
                </div>
            )}

            {error && (
                <div className="bg-gray-50 text-red-600 p-4 rounded mb-4 border border-gray-100 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-4 border border-gray-200/50 rounded bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors resize-none"
                    style={{ height: '92px', minHeight: '92px' }}
                    placeholder="Schreib dein Geheimnis hier ..."
                    required
                    maxLength={MAX_SECRET_LENGTH}
                />

                <div className="flex items-center justify-between">
                    <div className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {content.length} / {MAX_SECRET_LENGTH} Zeichen
                        {isOverLimit && ` (${Math.abs(remainingChars)} zu viel)`}
                        {content.length < MIN_SECRET_LENGTH && content.length > 0 && ` (mindestens ${MIN_SECRET_LENGTH} Zeichen benötigt)`}
                    </div>

                    <button
                        type="submit"
                        disabled={!isValid}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            border: 'none',
                            cursor: isValid ? 'pointer' : 'not-allowed',
                            backgroundColor: isValid ? '#d2901f' : '#e5e7eb',
                            color: isValid ? '#ffffff' : '#9ca3af',
                            boxShadow: isValid ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                            if (isValid) e.currentTarget.style.backgroundColor = '#d2901f'
                        }}
                        onMouseLeave={(e) => {
                            if (isValid) e.currentTarget.style.backgroundColor = '#d2901f'
                        }}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Wird gesendet ...
                            </span>
                        ) : (
                            'Absenden →'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}