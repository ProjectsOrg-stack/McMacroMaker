'use client'

import Link from 'next/link'
import { useAuth } from '../../components/AuthProvider'
import { useMacros } from '../../hooks/useMacros'
import { useState } from 'react'
import type { Macro } from '../../lib/types'

export default function DashboardPage() {
  const { user, signOut, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-text mb-2">Sign in to continue</h2>
          <p className="text-sm text-text-muted mb-6">Your macros are saved to your account.</p>
          <Link href="/auth" className="btn-primary">Go to sign in</Link>
        </div>
      </main>
    )
  }

  return <DashboardContent user={user} signOut={signOut} />
}

function DashboardContent({ user, signOut }: { user: any; signOut: () => void }) {
  const { macros, loading, deleteMacro } = useMacros(user.id)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    await deleteMacro(id)
    setDeleting(null)
  }

  return (
    <main className="min-h-screen bg-bg">
      <nav className="border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-text tracking-tight">
            <span className="text-accent">Mc</span>MacroMaker
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted hidden sm:block">{user.email}</span>
            <button onClick={signOut} className="btn-ghost text-xs">Sign out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text">Your Macros</h1>
            <p className="text-sm text-text-muted mt-1">
              {macros.length} macro{macros.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <Link href="/editor" className="btn-accent flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Macro
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : macros.length === 0 ? (
          <div className="card text-center py-16 animate-fade-in">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text mb-1">No macros yet</h3>
            <p className="text-sm text-text-muted mb-5">Create your first macro to get started.</p>
            <Link href="/editor" className="btn-primary">Create macro</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {macros.map((m: Macro) => (
              <MacroCard key={m.id} macro={m} onDelete={() => handleDelete(m.id)} deleting={deleting === m.id} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function MacroCard({ macro, onDelete, deleting }: { macro: Macro; onDelete: () => void; deleting: boolean }) {
  const lineCount = macro.code.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length
  const preview = macro.code.split('\n').filter(l => l.trim()).slice(0, 3)

  return (
    <div className="card-hover group relative">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-text truncate pr-2">{macro.title || 'Untitled'}</h3>
        <span className="text-[10px] text-text-faint shrink-0 font-mono">{lineCount} cmd{lineCount !== 1 ? 's' : ''}</span>
      </div>

      {macro.description && (
        <p className="text-xs text-text-muted mb-3 line-clamp-2">{macro.description}</p>
      )}

      <div className="bg-bg/50 rounded-lg p-2.5 mb-4 font-mono text-[11px] text-text-muted leading-relaxed">
        {preview.map((line, i) => (
          <div key={i} className="truncate">
            <span className={
              line.trim().startsWith('#') ? 'text-text-faint' :
              line.trim().startsWith('KEY') || line.trim().startsWith('MOUSE') ? 'text-cyan/70' :
              line.trim().startsWith('CHAT') ? 'text-accent/70' :
              line.trim().startsWith('DELAY') ? 'text-sand/70' :
              'text-text-muted'
            }>{line}</span>
          </div>
        ))}
        {macro.code.split('\n').filter(l => l.trim()).length > 3 && (
          <span className="text-text-faint">...</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/editor?id=${macro.id}`}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-center text-primary border border-primary/30 rounded-lg
                     hover:bg-primary/10 transition-all duration-200"
        >
          Edit
        </Link>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="px-3 py-1.5 text-xs text-text-faint hover:text-danger border border-border rounded-lg
                     hover:border-danger/30 hover:bg-danger/5 transition-all duration-200
                     disabled:opacity-50"
          aria-label="Delete macro"
        >
          {deleting ? (
            <span className="w-3 h-3 border-2 border-danger/30 border-t-danger rounded-full animate-spin inline-block" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50 text-[10px] text-text-faint">
        Updated {new Date(macro.updated_at).toLocaleDateString()}
      </div>
    </div>
  )
}
