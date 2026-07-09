'use client'

import Link from 'next/link'
import { useAuth } from '../../components/AuthProvider'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-4">Sign in or Sign up</h2>
          <Link href="/auth" className="text-blue-600">Go to auth</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Your Macros</h1>
          <div className="flex gap-2">
            <button onClick={() => signOut()} className="px-3 py-1 border rounded">Sign out</button>
            <Link href="/editor" className="px-3 py-1 bg-green-600 text-white rounded">New Macro</Link>
          </div>
        </div>
        <MacroList userId={user.id} />
      </div>
    </main>
  )
}

function MacroList({ userId }: { userId: string }) {
  const [macros, setMacros] = useState<any[] | null>(null)

  useEffect(() => {
    if (!userId) return
    try {
      const key = `macros:${userId}`
      const raw = localStorage.getItem(key) || '[]'
      const parsed = JSON.parse(raw)
      setMacros(parsed)
    } catch (e) {
      setMacros([])
    }
  }, [userId])

  if (macros === null) {
    return <div>Loading...</div>
  }

  if (macros.length === 0) {
    return <p>No macros yet. Create one ↗</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {macros.map((m: any) => (
        <div key={m.id} className="p-4 border rounded">
          <h3 className="font-semibold">{m.title || 'Untitled'}</h3>
          <p className="text-sm text-gray-600">{m.description}</p>
          <div className="mt-2 flex gap-2">
            <Link href={`/editor?id=${m.id}`} className="px-2 py-1 bg-blue-600 text-white rounded">Edit</Link>
          </div>
        </div>
      ))}
    </div>
  )
}
