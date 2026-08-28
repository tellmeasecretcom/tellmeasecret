import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'tellmeasecret – Dein anonymes Geheimnis',
  description: 'Teile deine Geheimnisse anonym und sicher. Jeden Tag neue Geständnisse – nur 24h verfügbar.',
  keywords: 'Geheimnis, anonym, Geständnis, tellmeasecret, Secrets',
  authors: [{ name: 'tellmeasecret' }],
  openGraph: {
    title: 'tellmeasecret – Dein anonymes Geheimnis',
    description: 'Teile deine Geheimnisse anonym und sicher. Jeden Tag neue Geständnisse.',
    url: 'https://tellmeasecret.com',
    siteName: 'tellmeasecret',
    locale: 'de_DE',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        {/* Google Analytics – Nur für Live-Umgebung */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-5QZG7H1BQ6"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5QZG7H1BQ6');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}