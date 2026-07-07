'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '../../components/AuthProvider'
import { v4 as uuidv4 } from 'uuid'
import { Bridge } from '../../lib/bridge'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export default function EditorPage() {
  const params = useSearchParams()
  const id = params?.get('id')
  const router = useRouter()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('/say hello')

  useEffect(() => {
    if (!user) return
    const key = `macros:${user.id}`
    const raw = localStorage.getItem(key) || '[]'
    const macros = JSON.parse(raw)
    const found = macros.find((m: any) => m.id === id)
    if (found) {
      setTitle(found.title)
      setDescription(found.description)
      setCode(found.code)
    }
  }, [id, user])

  function saveMacro() {
    if (!user) return alert('Sign in first')
    const key = `macros:${user.id}`
    const raw = localStorage.getItem(key) || '[]'
    const macros = JSON.parse(raw)
    if (id) {
      const idx = macros.findIndex((m: any) => m.id === id)
      if (idx !== -1) {
        macros[idx] = { ...macros[idx], title, description, code, updated_at: new Date().toISOString() }
      }
    } else {
      macros.push({ id: uuidv4(), title, description, code, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    }
    localStorage.setItem(key, JSON.stringify(macros))
    router.push('/dashboard')
  }

  async function runMacro() {
    try {
      const bridge = new Bridge()
      const lines = code.split('\n').map(l => l.trim()).filter(Boolean)
      for (const ln of lines) {
        const payload = { command: ln, delayMs: 100 }
        await bridge.send(JSON.stringify(payload))
      }
      alert('Macro sent to local bridge (if running)')
    } catch (e) {
      console.error(e)
      alert('Failed to send to bridge')
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-4 mb-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Macro title" className="flex-1 p-2 border rounded" />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" className="w-96 p-2 border rounded" />
        </div>
        <div style={{ height: 400 }} className="border">
          <MonacoEditor height="100%" defaultLanguage="plaintext" value={code} onChange={(v) => setCode(v || '')} />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={saveMacro} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
          <button onClick={runMacro} className="px-3 py-1 bg-green-600 text-white rounded">Run</button>
        </div>
      </div>
    </main>
  )
}
