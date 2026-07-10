'use client'

import type { BridgeStatus as BridgeStatusType } from '../../lib/types'

interface BridgeStatusProps {
  status: BridgeStatusType
  demoMode: boolean
  onCheck: () => void
  onToggleDemo: (v: boolean) => void
}

const statusConfig: Record<BridgeStatusType, { color: string; label: string }> = {
  disconnected: { color: 'bg-text-faint', label: 'Disconnected' },
  connecting:   { color: 'bg-sand animate-pulse', label: 'Connecting...' },
  available:    { color: 'bg-accent', label: 'Connected' },
  unavailable:  { color: 'bg-danger', label: 'Not Available' },
}

export function BridgeStatus({ status, demoMode, onCheck, onToggleDemo }: BridgeStatusProps) {
  const cfg = statusConfig[status]

  return (
    <div className="p-3 bg-surface border border-border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.color}`} aria-hidden="true" />
          <span className="text-sm font-medium text-text">Bridge: {cfg.label}</span>
        </div>
        <button
          onClick={onCheck}
          aria-label="Check bridge connection"
          className="btn-ghost px-3 py-1 text-xs font-medium"
        >
          Check
        </button>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={demoMode}
          onChange={e => onToggleDemo(e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40"
        />
        <span className="text-sm text-muted">Demo mode (simulate locally)</span>
      </label>
    </div>
  )
}
