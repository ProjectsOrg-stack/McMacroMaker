'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Macro } from '../lib/types'

export function useMacros(userId: string | undefined) {
  const [macros, setMacros] = useState<Macro[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('macros')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (!error && data) {
        setMacros(data as Macro[])
      }
      setLoading(false)
    }
    load()
  }, [userId])

  const saveMacro = useCallback(async (data: { id?: string; title: string; description: string; code: string }): Promise<Macro | null> => {
    if (!userId) return null

    if (data.id) {
      const { data: updated, error } = await supabase
        .from('macros')
        .update({
          title: data.title,
          description: data.description,
          code: data.code,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (!error && updated) {
        setMacros(prev => prev.map(m => m.id === updated.id ? updated as Macro : m))
        return updated as Macro
      }
    }

    const { data: inserted, error } = await supabase
      .from('macros')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        code: data.code,
      })
      .select()
      .single()

    if (!error && inserted) {
      setMacros(prev => [inserted as Macro, ...prev])
      return inserted as Macro
    }

    return null
  }, [userId])

  const deleteMacro = useCallback(async (id: string) => {
    if (!userId) return
    const { error } = await supabase
      .from('macros')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (!error) {
      setMacros(prev => prev.filter(m => m.id !== id))
    }
  }, [userId])

  const getMacro = useCallback(async (id: string): Promise<Macro | null> => {
    if (!userId) return null
    const cached = macros.find(m => m.id === id)
    if (cached) return cached

    const { data, error } = await supabase
      .from('macros')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!error && data) return data as Macro
    return null
  }, [userId, macros])

  return { macros, loading, saveMacro, deleteMacro, getMacro }
}
