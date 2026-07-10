'use client'

import type { BridgeStatus as BridgeStatusType } from '../../lib/types'

interface BridgeStatusProps {
  status: BridgeStatusType
  demoMode: boolean
  onCheck: () => void
  onToggleDemo: (v: boolean) => void
}

const statusConfig: Record<BridgeStatusType, { color: string; label: string }> = {
  disconnected: { color: 'bg-gray-400', label: 'Disconnected' },
  connecting:   { color: 'bg-yellow-400 animate-pulse', label: 'Connecting...' },
  available:    { color: 'bg-green-500', label: 'Connected' },
  unavailable:  { color: 'bg-red-500', label: 'Not Available' },
}

export function BridgeStatus({ status, demoMode, onCheck, onToggleDemo }: BridgeStatusProps) {
  const cfg = statusConfig[status]

  return (
    <div className="p-3 bg-panel border border-gray-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.color}`} aria-hidden="true" />
          <span className="text-sm font-medium">Bridge: {cfg.label}</span>
        </div>
        <button
          onClick={onCheck}
          aria-label="Check bridge connection"
          className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40
                     transition-colors"
        >
          Check
        </button>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={demoMode}
          onChange={e => onToggleDemo(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/40"
        />
        <span className="text-sm text-muted">Demo mode (simulate locally)</span>
      </label>
    </div>
  )
}
