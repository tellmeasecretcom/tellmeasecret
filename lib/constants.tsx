// lib/constants.tsx – Alle zentralen Konstanten (mit JSX)

export const popupContent = {
    impressum: {
        title: 'Impressum',
        content: (
            <div className="text-gray-700 text-sm leading-relaxed space-y-4">
                <p><strong>Angaben gemäß § 5 DDG</strong></p>
                <p>
                    <strong>Mohamed Haimani</strong><br />
                    Paul-Heyse-Str. 32<br />
                    80336 München
                </p>
                <p>
                    <strong>Kontakt</strong><br />
                    E-Mail: hallo@tellmeasecret.com
                </p>
                <p>
                    <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</strong><br />
                    Mohamed Haimani (Adresse siehe oben)
                </p>
            </div>
        ),
    },
    datenschutz: {
        title: 'Datenschutz',
        content: (
            <div className="text-gray-700 text-sm leading-relaxed space-y-4">
                <p><strong>Datenschutzerklärung</strong></p>
                <p>
                    Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung erklärt,
                    wie wir mit Ihren Daten umgehen, wenn Sie unsere Plattform tellmeasecret.com nutzen.
                </p>
                <p><strong>1. Verantwortlicher</strong></p>
                <p>
                    <strong>Mohamed Haimani</strong><br />
                    Paul-Heyse-Str. 32<br />
                    80336 München
                </p>
                <p><strong>2. Erhebung und Speicherung personenbezogener Daten</strong></p>
                <p>
                    Wir erheben keine personenbezogenen Daten. Alle eingereichten Geheimnisse sind anonym
                    und werden ohne Zuordnung zu Ihrer Person gespeichert.
                </p>
                <p><strong>3. Cookies</strong></p>
                <p>
                    Wir verwenden ausschließlich technisch notwendige Cookies zur Aufrechterhaltung der
                    Session. Es werden keine Tracking-Cookies eingesetzt.
                </p>
                <p><strong>4. Ihre Rechte</strong></p>
                <p>
                    Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung
                    Ihrer gespeicherten Daten. Kontaktieren Sie uns hierzu über die angegebenen Kontaktdaten.
                </p>
            </div>
        ),
    },
    kontakt: {
        title: 'Kontakt',
        content: (
            <div className="text-gray-700 text-sm leading-relaxed space-y-4">
                <p><strong>Wir freuen uns auf Ihre Nachricht!</strong></p>
                <form
                    id="contact-form"
                    onSubmit={async (e) => {
                        e.preventDefault()
                        const form = e.target as HTMLFormElement
                        const formData = new FormData(form)
                        const data = {
                            name: formData.get('name'),
                            email: formData.get('email'),
                            message: formData.get('message'),
                            honeypot: formData.get('honeypot'),
                        }
                        const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement
                        const statusDiv = document.getElementById('contact-status')
                        if (statusDiv) {
                            statusDiv.innerHTML = '<span className="text-gray-500">Wird gesendet ...</span>'
                            statusDiv.className = 'text-sm text-gray-500'
                        }
                        try {
                            const response = await fetch('/api/contact', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data),
                            })
                            const result = await response.json()
                            if (response.ok) {
                                if (statusDiv) {
                                    statusDiv.innerHTML = `<span className="text-green-600">${result.message}</span>`
                                    statusDiv.className = 'text-sm text-green-600'
                                }
                                form.reset()
                            } else {
                                if (statusDiv) {
                                    statusDiv.innerHTML = `<span className="text-red-600">${result.error || 'Fehler beim Senden'}</span>`
                                    statusDiv.className = 'text-sm text-red-600'
                                }
                            }
                        } catch {
                            if (statusDiv) {
                                statusDiv.innerHTML =
                                    '<span className="text-red-600">Fehler beim Senden. Bitte versuche es später nochmal.</span>'
                                statusDiv.className = 'text-sm text-red-600'
                            }
                        } finally {
                            submitBtn.disabled = false
                        }
                    }}
                >
                    <div style={{ display: 'none' }}>
                        <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-1">Dein Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400 transition-colors text-sm"
                            placeholder="z.B. Max Mustermann"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-1">E-Mail-Adresse</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400 transition-colors text-sm"
                            placeholder="max@beispiel.de"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-1">Nachricht</label>
                        <textarea
                            name="message"
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400 transition-colors text-sm resize-none"
                            placeholder="Deine Nachricht an uns ..."
                        />
                    </div>
                    <div id="contact-status" className="text-sm"></div>
                    <button
                        type="submit"
                        className="w-full bg-gray-900 text-white py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        Nachricht senden
                    </button>
                </form>
                <p className="text-gray-400 text-xs pt-2">* Wir antworten in der Regel innerhalb von 24 Stunden.</p>
            </div>
        ),
    },
} as const

export const MAX_SECRET_LENGTH = 500
export const MIN_SECRET_LENGTH = 20
export const DEFAULT_PRICE = 0.49