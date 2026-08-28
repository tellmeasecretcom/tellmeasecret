'use client'

import ExpandableText from './ExpandableText'

interface Secret {
  id: string
  content: string
  status: string
  created_at: string
  updated_at: string
  is_premium: boolean
}

export default function SecretTableRow({
  secret,
  onAction,
  onTogglePremium,
  formatDate,
}: {
  secret: Secret
  onAction: (id: string, action: 'approve' | 'reject' | 'reset') => void
  onTogglePremium: (id: string, currentStatus: boolean) => void
  formatDate: (date: string) => string
}) {
  const statusMap = {
    pending: { label: 'Ausstehend', className: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Genehmigt', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Abgelehnt', className: 'bg-red-100 text-red-800' },
  }

  const statusInfo = statusMap[secret.status as keyof typeof statusMap] || statusMap.pending

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
        <ExpandableText text={secret.content} maxLength={80} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(secret.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {secret.status === 'pending' ? (
          <span className="text-gray-400">—</span>
        ) : (
          formatDate(secret.updated_at)
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {secret.status === 'approved' ? (
          <button
            onClick={() => onTogglePremium(secret.id, secret.is_premium)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
              secret.is_premium
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-base">{secret.is_premium ? '⭐' : '☆'}</span>
            {secret.is_premium ? 'Premium' : 'Standard'}
          </button>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {secret.status === 'pending' ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAction(secret.id, 'approve')}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
            >
              ✅ Freigeben
            </button>
            <button
              onClick={() => onAction(secret.id, 'reject')}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
            >
              ❌ Ablehnen
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAction(secret.id, 'reset')}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
          >
            🔄 Zurücksetzen
          </button>
        )}
      </td>
    </tr>
  )
}