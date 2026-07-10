'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handle(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) return setError(error.message)
      router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) return setError(error.message)
      setSuccess('Check your email for a verification link.')
    }
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold text-text tracking-tight">
            <span className="text-accent">Mc</span>MacroMaker
          </Link>
          <p className="text-sm text-text-muted mt-2">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="px-3 py-2 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="px-3 py-2 text-xs text-accent bg-accent/10 border border-accent/20 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'signin' ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess('') }}
              className="text-xs text-text-muted hover:text-primary transition-colors"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/editor" className="text-xs text-text-faint hover:text-text-muted transition-colors">
            or try the editor in demo mode &rarr;
          </Link>
        </div>
      </div>
    </main>
  )
}
