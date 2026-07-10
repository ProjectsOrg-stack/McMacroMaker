'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import type { ShortcutAction, ShortcutBinding } from '../lib/types'

const STORAGE_KEY = 'mcmacro:shortcuts'

const DEFAULT_SHORTCUTS: ShortcutBinding[] = [
  { action: 'run', label: 'Run macro', key: 'Enter', ctrl: true, shift: false, alt: false, meta: false },
  { action: 'save', label: 'Save macro', key: 's', ctrl: true, shift: false, alt: false, meta: false },
  { action: 'stop', label: 'Stop macro', key: 'Escape', ctrl: false, shift: false, alt: false, meta: false },
  { action: 'checkBridge', label: 'Check bridge', key: 'b', ctrl: true, shift: true, alt: false, meta: false },
  { action: 'toggleDemo', label: 'Toggle demo mode', key: 'd', ctrl: true, shift: true, alt: false, meta: false },
]

function loadBindings(): ShortcutBinding[] {
  if (typeof window === 'undefined') return DEFAULT_SHORTCUTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SHORTCUTS
    const parsed = JSON.parse(raw) as ShortcutBinding[]
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SHORTCUTS
    const savedActions = new Set(parsed.map(b => b.action))
    const missing = DEFAULT_SHORTCUTS.filter(d => !savedActions.has(d.action))
    return [...parsed, ...missing]
  } catch {
    return DEFAULT_SHORTCUTS
  }
}

function saveBindings(bindings: ShortcutBinding[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings))
}

export function formatBinding(b: ShortcutBinding): string {
  const parts: string[] = []
  if (b.ctrl || b.meta) parts.push(navigator?.platform?.includes('Mac') ? '⌘' : 'Ctrl')
  if (b.shift) parts.push(navigator?.platform?.includes('Mac') ? '⇧' : 'Shift')
  if (b.alt) parts.push(navigator?.platform?.includes('Mac') ? '⌥' : 'Alt')
  const keyLabel = b.key === ' ' ? 'Space' : b.key.length === 1 ? b.key.toUpperCase() : b.key
  parts.push(keyLabel)
  return parts.join(navigator?.platform?.includes('Mac') ? '' : '+')
}

function matchesEvent(e: KeyboardEvent, b: ShortcutBinding): boolean {
  const modCtrl = e.ctrlKey || e.metaKey
  const wantsCtrl = b.ctrl || b.meta
  if (modCtrl !== wantsCtrl) return false
  if (e.shiftKey !== b.shift) return false
  if (e.altKey !== b.alt) return false
  return e.key === b.key || e.key.toLowerCase() === b.key.toLowerCase()
}

export function useShortcuts(handlers: Partial<Record<ShortcutAction, () => void>>) {
  const [bindings, setBindings] = useState<ShortcutBinding[]>(loadBindings)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      for (const binding of bindings) {
        if (matchesEvent(e, binding)) {
          const handler = handlersRef.current[binding.action]
          if (handler) {
            e.preventDefault()
            e.stopPropagation()
            handler()
          }
          return
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [bindings])

  const updateBinding = useCallback((action: ShortcutAction, newBinding: Omit<ShortcutBinding, 'action' | 'label'>) => {
    setBindings(prev => {
      const updated = prev.map(b =>
        b.action === action ? { ...b, ...newBinding } : b
      )
      saveBindings(updated)
      return updated
    })
  }, [])

  const resetDefaults = useCallback(() => {
    saveBindings(DEFAULT_SHORTCUTS)
    setBindings(DEFAULT_SHORTCUTS)
  }, [])

  return { bindings, updateBinding, resetDefaults }
}
