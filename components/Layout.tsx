'use client'

import { useState } from 'react'
import { popupContent } from '@/lib/constants'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [activePopup, setActivePopup] = useState<'impressum' | 'datenschutz' | 'kontakt' | null>(null)
  const closePopup = () => setActivePopup(null)

  const currentPopup = activePopup ? popupContent[activePopup] : null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main
        className="flex-1 py-8"
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        {activePopup && currentPopup ? (
          <div className="relative" style={{ paddingTop: '20px' }}>
            <button
              onClick={closePopup}
              className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none z-10"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h2 className="text-2xl font-serif font-light text-gray-800 mb-6 pr-8">
              {currentPopup.title}
            </h2>
            {currentPopup.content}
          </div>
        ) : (
          children
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 mt-8">
        <div className="max-w-640px mx-auto px-4 text-center text-xs text-gray-400 space-y-3">
          <p>© {new Date().getFullYear()} tellmeasecret.com</p>
          <div className="h-6">&nbsp;</div>
          <div className="h-6">&nbsp;</div>
          <div className="h-6">&nbsp;</div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setActivePopup('impressum')}
              className="hover:text-gray-600 transition-colors bg-transparent p-0 border-0"
            >
              Impressum
            </button>
            <span className="text-gray-300"> </span>
            <button
              onClick={() => setActivePopup('datenschutz')}
              className="hover:text-gray-600 transition-colors bg-transparent p-0 border-0"
            >
              Datenschutz
            </button>
            <span className="text-gray-300"> </span>
            <button
              onClick={() => setActivePopup('kontakt')}
              className="hover:text-gray-600 transition-colors bg-transparent p-0 border-0"
            >
              Kontakt
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}