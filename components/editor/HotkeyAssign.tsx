'use client'

import { useState, useEffect } from 'react'

interface HotkeyAssignProps {
  currentHotkey: { key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean } | null
  onAssign: (hotkey: { key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean }) => void
  onClear: () => void
  bridgeAvailable: boolean
  hotkeysSupported: boolean
}

function formatHotkey(hk: { key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean }): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac')
  const parts: string[] = []
  if (hk.ctrl || hk.meta) parts.push(isMac ? '⌘' : 'Ctrl')
  if (hk.shift) parts.push(isMac ? '⇧' : 'Shift')
  if (hk.alt) parts.push(isMac ? '⌥' : 'Alt')
  parts.push(hk.key.length === 1 ? hk.key.toUpperCase() : hk.key)
  return parts.join(isMac ? '' : '+')
}

export function HotkeyAssign({ currentHotkey, onAssign, onClear, bridgeAvailable, hotkeysSupported }: HotkeyAssignProps) {
  const [listening, setListening] = useState(false)

  useEffect(() => {
    if (!listening) return
    function onKey(e: KeyboardEvent) {
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return
      e.preventDefault()
      e.stopPropagation()
      onAssign({
        key: e.key,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
      })
      setListening(false)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [listening, onAssign])

  if (!bridgeAvailable) return null

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-700">Global Hotkey</h3>
        {!hotkeysSupported && (
          <span className="text-[10px] text-amber-600">Restart bridge with npm install</span>
        )}
      </div>
      {hotkeysSupported ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setListening(!listening)}
            className={`flex-1 px-3 py-1.5 text-xs font-mono rounded-md border transition-colors text-center
              ${listening
                ? 'border-primary bg-primary/5 text-primary animate-pulse'
                : currentHotkey
                  ? 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  : 'border-dashed border-gray-300 text-gray-400 hover:border-gray-400'
              }`}
          >
            {listening ? 'Press keys...' : currentHotkey ? formatHotkey(currentHotkey) : 'Click to assign'}
          </button>
          {currentHotkey && (
            <button
              onClick={onClear}
              className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Remove hotkey"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <p className="text-[10px] text-gray-500">
          Global hotkeys require <code className="bg-gray-100 px-1 rounded">node-global-key-listener</code>.
          Reinstall the bridge to enable.
        </p>
      )}
      <p className="text-[10px] text-gray-400">
        {currentHotkey
          ? 'Press this key combo from Minecraft to run the macro — no browser needed.'
          : 'Assign a key combo to trigger this macro from anywhere.'}
      </p>
    </div>
  )
}
