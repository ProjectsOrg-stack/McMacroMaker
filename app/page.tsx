'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const DEMO_LINES = [
  '# Auto-sell macro',
  'DELAY 3000',
  'KEY TAP 1',
  'DELAY 200',
  'KEY TAP t',
  'DELAY 200',
  'CHAT /ah sell 20k',
  'DELAY 1000',
  'MOUSE_MOVE 810 285',
  'DELAY 200',
  'MOUSE_CLICK left',
]

function TypewriterDemo() {
  const [lines, setLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [activeLine, setActiveLine] = useState(-1)

  useEffect(() => {
    if (currentLine >= DEMO_LINES.length) {
      const t = setTimeout(() => {
        setLines([])
        setCurrentLine(0)
        setCurrentChar(0)
        setActiveLine(-1)
      }, 3000)
      return () => clearTimeout(t)
    }

    const line = DEMO_LINES[currentLine]
    if (currentChar <= line.length) {
      const t = setTimeout(() => {
        setLines(prev => {
          const copy = [...prev]
          copy[currentLine] = line.slice(0, currentChar)
          return copy
        })
        setCurrentChar(c => c + 1)
      }, 25 + Math.random() * 20)
      return () => clearTimeout(t)
    }

    setActiveLine(currentLine)
    const t = setTimeout(() => {
      setCurrentLine(l => l + 1)
      setCurrentChar(0)
      setActiveLine(-1)
    }, 400)
    return () => clearTimeout(t)
  }, [currentLine, currentChar])

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-cyan/20 rounded-2xl blur-xl" />
      <div className="relative bg-bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-bg/50">
          <span className="w-3 h-3 rounded-full bg-danger/60" />
          <span className="w-3 h-3 rounded-full bg-sand/60" />
          <span className="w-3 h-3 rounded-full bg-accent/60" />
          <span className="ml-2 text-xs text-text-muted font-mono">macro.mcm</span>
        </div>
        <div className="p-4 font-mono text-sm leading-relaxed min-h-[280px]">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`flex gap-3 transition-all duration-200 ${
                activeLine === i ? 'bg-accent/10 -mx-4 px-4 py-0.5 rounded' : ''
              }`}
            >
              <span className="text-text-faint select-none w-5 text-right shrink-0">
                {i + 1}
              </span>
              <span className={
                line.startsWith('#') ? 'text-text-muted' :
                line.startsWith('DELAY') ? 'text-sand' :
                line.startsWith('KEY') || line.startsWith('MOUSE') ? 'text-cyan' :
                line.startsWith('CHAT') ? 'text-accent' :
                'text-text'
              }>
                {line}
                {i === currentLine && currentChar <= DEMO_LINES[currentLine]?.length && (
                  <span className="inline-block w-2 h-4 bg-primary animate-glow-pulse ml-0.5 align-text-bottom" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: 'Simple DSL',
    desc: 'Write macros in plain text. No programming needed — just CHAT, KEY, MOUSE, and DELAY.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Global Hotkeys',
    desc: 'Assign key combos to macros. Trigger them from Minecraft — no browser needed.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Macro Recorder',
    desc: 'Record your keystrokes live and auto-generate macro DSL. No typing required.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.017 4.358v4.992" />
      </svg>
    ),
    title: 'Loop & Repeat',
    desc: 'Add LOOP 10 to any macro. Perfect for farming, selling, or repetitive tasks.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Demo Mode',
    desc: 'Test macros in-browser without the bridge. See timestamped execution logs.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
    title: 'Cloud Sync',
    desc: 'Macros save to your account. Access them from any device, anytime.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-text tracking-tight">
            <span className="text-accent">Mc</span>MacroMaker
          </span>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="btn-ghost text-xs">
              Sign in
            </Link>
            <Link href="/auth" className="btn-primary text-xs">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-glow-pulse" />
                Open source Minecraft automation
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text leading-tight tracking-tight">
                Build Macros.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan to-accent">
                  Break Limits.
                </span>
              </h1>
              <p className="text-lg text-text-muted max-w-md leading-relaxed">
                Write, record, and run Minecraft macros with a simple DSL.
                Global hotkeys, cloud sync, and a local bridge that sends real input.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Link href="/auth" className="btn-primary text-base px-8 py-3">
                  Start building
                </Link>
                <Link href="/editor" className="btn-ghost text-base px-6 py-3">
                  Try demo
                </Link>
              </div>
            </div>
            <div className="animate-slide-up">
              <TypewriterDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-text mb-3">Everything you need</h2>
          <p className="text-text-muted max-w-md mx-auto">
            From writing your first macro to running complex automation sequences.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="card-hover group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:shadow-glow transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-text mb-1.5">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-cyan/10" />
          <div className="relative card border-border/50 text-center py-14 px-6">
            <h2 className="text-2xl font-bold text-text mb-3">Ready to automate?</h2>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Create an account, write your macro, and start it with a single hotkey.
            </p>
            <Link href="/auth" className="btn-accent text-base px-8 py-3">
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-text-faint">
          <span>McMacroMaker</span>
          <span>Open source on GitHub</span>
        </div>
      </footer>
    </main>
  )
}
