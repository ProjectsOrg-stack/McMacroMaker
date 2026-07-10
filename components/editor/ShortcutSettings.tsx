'use client'

import { useState, useEffect, useRef } from 'react'
import type { ShortcutAction, ShortcutBinding } from '../../lib/types'
import { formatBinding } from '../../hooks/useShortcuts'

interface ShortcutSettingsProps {
  bindings: ShortcutBinding[]
  onUpdate: (action: ShortcutAction, binding: Omit<ShortcutBinding, 'action' | 'label'>) => void
  onReset: () => void
  open: boolean
  onClose: () => void
}

export function ShortcutSettings({ bindings, onUpdate, onReset, open, onClose }: ShortcutSettingsProps) {
  const [recording, setRecording] = useState<ShortcutAction | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!recording) return
    function onKey(e: KeyboardEvent) {
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return
      e.preventDefault()
      e.stopPropagation()
      onUpdate(recording!, {
        key: e.key,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
      })
      setRecording(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [recording, onUpdate])

  useEffect(() => {
    if (!open) return
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape' && !recording) {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, recording, onClose])

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={dialogRef}
        className="glass rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            aria-label="Close shortcuts"
            className="text-faint hover:text-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-3 space-y-1">
          {bindings.map(b => (
            <div
              key={b.action}
              className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
            >
              <span className="text-sm text-text">{b.label}</span>
              <button
                onClick={() => setRecording(recording === b.action ? null : b.action)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors min-w-[100px] text-center
                  ${recording === b.action
                    ? 'border-primary bg-primary/10 text-primary animate-pulse'
                    : 'border-border bg-surface text-text hover:border-border-light hover:bg-bg-hover'
                  }`}
              >
                {recording === b.action ? 'Press keys...' : formatBinding(b)}
              </button>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <button
            onClick={() => { onReset(); setRecording(null) }}
            className="text-xs text-muted hover:text-text transition-colors"
          >
            Reset to defaults
          </button>
          <p className="text-[10px] text-faint">Click a binding, then press your desired keys</p>
        </div>
      </div>
    </div>
  )
}
