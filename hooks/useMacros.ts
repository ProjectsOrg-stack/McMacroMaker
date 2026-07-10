'use client'

import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Macro } from '../lib/types'

const macrosKey = (userId: string) => `macros:${userId}`

export function useMacros(userId: string | undefined) {
  const [macros, setMacros] = useState<Macro[]>([])

  useEffect(() => {
    if (!userId) return
    try {
      const raw = localStorage.getItem(macrosKey(userId)) || '[]'
      setMacros(JSON.parse(raw))
    } catch {
      setMacros([])
    }
  }, [userId])

  const persist = useCallback((updated: Macro[]) => {
    if (!userId) return
    localStorage.setItem(macrosKey(userId), JSON.stringify(updated))
    setMacros(updated)
  }, [userId])

  const saveMacro = useCallback((data: { id?: string; title: string; description: string; code: string }): Macro => {
    const now = new Date().toISOString()
    let updated: Macro[]
    let saved: Macro

    if (data.id) {
      updated = macros.map(m => {
        if (m.id === data.id) {
          saved = { ...m, title: data.title, description: data.description, code: data.code, updated_at: now }
          return saved!
        }
        return m
      })
      if (!saved!) {
        saved = { id: data.id, title: data.title, description: data.description, code: data.code, created_at: now, updated_at: now }
        updated = [...macros, saved]
      }
    } else {
      saved = { id: uuidv4(), title: data.title, description: data.description, code: data.code, created_at: now, updated_at: now }
      updated = [...macros, saved]
    }

    persist(updated)
    return saved!
  }, [macros, persist])

  const deleteMacro = useCallback((id: string) => {
    persist(macros.filter(m => m.id !== id))
  }, [macros, persist])

  const getMacro = useCallback((id: string): Macro | undefined => {
    return macros.find(m => m.id === id)
  }, [macros])

  return { macros, saveMacro, deleteMacro, getMacro }
}
