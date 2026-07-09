'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const router = useRouter()

  async function handle() {
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return alert(error.message)
      router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) return alert(error.message)
      alert('Check your email for verification (if enabled)')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 border rounded">
        <h2 className="text-xl font-bold mb-4">{mode === 'signin' ? 'Sign in' : 'Sign up'}</h2>
        <input className="w-full p-2 border rounded mb-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border rounded mb-4" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={handle} className="px-3 py-1 bg-blue-600 text-white rounded">{mode === 'signin' ? 'Sign in' : 'Sign up'}</button>
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="px-3 py-1 border rounded">Switch</button>
        </div>
      </div>
    </main>
  )
}
