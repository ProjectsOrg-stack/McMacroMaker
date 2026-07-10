'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface RecordedEvent {
  key: string
  state: string
  timestamp: number
}

interface MacroRecorderProps {
  bridgeAvailable: boolean
  hotkeysSupported: boolean
  onStartRecording: () => Promise<void>
  onStopRecording: () => Promise<void>
  onInsert: (code: string) => void
  onBridgeMessage: (handler: (msg: any) => void) => void
  offBridgeMessage: (handler: (msg: any) => void) => void
}

function eventsToMacro(events: RecordedEvent[]): string {
  if (events.length === 0) return ''
  const lines: string[] = ['# Recorded macro']
  let lastTime = events[0].timestamp

  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    const gap = ev.timestamp - lastTime
    if (gap > 50 && i > 0) {
      lines.push(`DELAY ${Math.round(gap)}`)
    }
    lines.push(`KEY TAP ${ev.key.toLowerCase()}`)
    lastTime = ev.timestamp
  }
  return lines.join('\n')
}

export function MacroRecorder({
  bridgeAvailable,
  hotkeysSupported,
  onStartRecording,
  onStopRecording,
  onInsert,
  onBridgeMessage,
  offBridgeMessage,
}: MacroRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [events, setEvents] = useState<RecordedEvent[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const eventsRef = useRef<RecordedEvent[]>([])

  const handleMessage = useCallback((raw: any) => {
    try {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (obj.event === 'recordedKey') {
        const ev: RecordedEvent = {
          key: obj.key,
          state: obj.state,
          timestamp: Date.now(),
        }
        eventsRef.current = [...eventsRef.current, ev]
        setEvents(eventsRef.current)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!recording) return
    onBridgeMessage(handleMessage)
    return () => offBridgeMessage(handleMessage)
  }, [recording, handleMessage, onBridgeMessage, offBridgeMessage])

  async function startRec() {
    eventsRef.current = []
    setEvents([])
    setPreview(null)
    try {
      await onStartRecording()
      setRecording(true)
    } catch {}
  }

  async function stopRec() {
    try { await onStopRecording() } catch {}
    setRecording(false)
    const code = eventsToMacro(eventsRef.current)
    setPreview(code)
  }

  if (!bridgeAvailable || !hotkeysSupported) return null

  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-text">Macro Recorder</h3>
        {recording && (
          <span className="flex items-center gap-1 text-[10px] text-danger">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            Recording ({events.length} keys)
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {!recording ? (
          <button
            onClick={startRec}
            className="btn-danger flex-1 flex items-center justify-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            Record
          </button>
        ) : (
          <button
            onClick={stopRec}
            className="btn-ghost flex-1 flex items-center justify-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Stop
          </button>
        )}
      </div>

      {preview && (
        <div className="space-y-2">
          <pre className="text-[10px] bg-bg border border-border rounded p-2 max-h-32 overflow-auto font-mono whitespace-pre-wrap text-text">
            {preview}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={() => { onInsert(preview); setPreview(null) }}
              className="btn-primary flex-1"
            >
              Insert into editor
            </button>
            <button
              onClick={() => setPreview(null)}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-faint">
        {recording
          ? 'Press keys in Minecraft — they will be captured. Click Stop when done.'
          : 'Record your keystrokes to auto-generate macro DSL.'}
      </p>
    </div>
  )
}
