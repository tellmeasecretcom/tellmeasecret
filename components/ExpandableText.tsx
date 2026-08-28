'use client'

import { useState } from 'react'

interface ExpandableTextProps {
  text: string
  maxLength?: number
  className?: string
}

export default function ExpandableText({ 
  text, 
  maxLength = 80, 
  className = '' 
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const isLong = text.length > maxLength
  const displayText = isExpanded ? text : text.slice(0, maxLength)

  if (!isLong) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {displayText}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="ml-1 text-gray-400 hover:text-gray-600 font-medium focus:outline-none"
          aria-label="Mehr anzeigen"
        >
          ...
        </button>
      )}
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="ml-2 text-gray-400 hover:text-gray-600 font-medium text-xs focus:outline-none"
          aria-label="Weniger anzeigen"
        >
          [weniger]
        </button>
      )}
    </span>
  )
}