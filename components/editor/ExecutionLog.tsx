'use client'

import { useRef, useEffect, useState } from 'react'
import type { LogEntry, LogLevel } from '../../lib/types'

interface ExecutionLogProps {
  entries: LogEntry[]
  onClear: () => void
}

type FilterType = 'all' | 'info' | 'error' | 'success'

const levelColors: Record<LogLevel, string> = {
  info:    'text-blue-300',
  error:   'text-red-400',
  success: 'text-green-400',
  warn:    'text-yellow-400',
}

export function ExecutionLog({ entries, onClear }: ExecutionLogProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [autoScroll, setAutoScroll] = useState(true)

  const filtered = filter === 'all' ? entries : entries.filter(e => e.level === filter)

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [filtered.length, autoScroll])

  function handleScroll() {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40)
  }

  function downloadLogs() {
    const text = entries.map(e => `[${e.timestamp}] [${e.level.toUpperCase()}] ${e.message}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `macro-log-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filters: FilterType[] = ['all', 'info', 'error', 'success']

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Execution Log</h3>
        <div className="flex gap-1">
          <button
            onClick={downloadLogs}
            aria-label="Download logs"
            className="p-1 text-faint hover:text-text transition-colors"
            title="Download logs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={onClear}
            aria-label="Clear logs"
            className="p-1 text-faint hover:text-text transition-colors"
            title="Clear"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-1">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors
              ${filter === f ? 'bg-primary text-white' : 'bg-bg-hover text-muted hover:text-text'}`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Execution log output"
        className="h-48 overflow-auto p-3 rounded-lg text-xs font-mono bg-codeBg text-text"
      >
        {filtered.length === 0 ? (
          <div className="text-faint italic">No activity yet</div>
        ) : (
          filtered.map((entry, i) => (
            <div key={i} className="whitespace-pre-wrap leading-5">
              <span className="text-faint">{entry.timestamp}</span>{' '}
              <span className={levelColors[entry.level]}>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
