'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../components/AuthProvider'
import { useBridge } from '../../hooks/useBridge'
import { useMacros } from '../../hooks/useMacros'
import { useShortcuts } from '../../hooks/useShortcuts'
import { parseMacro, DEFAULT_MACRO } from '../../lib/parser'
import type { LogEntry } from '../../lib/types'

import { EditorHeader } from '../../components/editor/EditorHeader'
import { BridgeStatus } from '../../components/editor/BridgeStatus'
import { ActionButtons } from '../../components/editor/ActionButtons'
import { OnboardPanel } from '../../components/editor/OnboardPanel'
import { ExecutionLog } from '../../components/editor/ExecutionLog'
import { MacroExamplesTab } from '../../components/editor/MacroExamplesTab'
import { ShortcutSettings } from '../../components/editor/ShortcutSettings'
import { HotkeyAssign } from '../../components/editor/HotkeyAssign'
import { MacroRecorder } from '../../components/editor/MacroRecorder'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export default function EditorPage() {
  const params = useSearchParams()
  const macroId = params?.get('id') || undefined
  const router = useRouter()
  const { user } = useAuth()
  const { saveMacro: persistMacro, getMacro } = useMacros(user?.id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState(DEFAULT_MACRO)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [demoMode, setDemoMode] = useState(
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  )
  const [showOnboard, setShowOnboard] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'examples'>('editor')
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [assignedHotkey, setAssignedHotkey] = useState<{ key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean } | null>(null)
  const [hotkeysSupported, setHotkeysSupported] = useState(false)
  const loadedRef = useRef(false)

  const appendLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      level,
    }])
  }, [])

  const bridgeLogHandler = useCallback((entry: LogEntry) => {
    setLogs(prev => [...prev, entry])
  }, [])

  const bridge = useBridge(bridgeLogHandler)

  useEffect(() => {
    if (loadedRef.current || !user || !macroId) return
    loadedRef.current = true
    getMacro(macroId).then(found => {
      if (found) {
        setTitle(found.title)
        setDescription(found.description)
        setCode(found.code)
      }
    })
  }, [user, macroId, getMacro])

  async function handleCheckBridge() {
    try {
      const pong = await bridge.checkBridge()
      setShowOnboard(false)
      if (pong?.hotkeys) setHotkeysSupported(true)
    } catch {
      setShowOnboard(true)
    }
  }

  async function handleSave() {
    if (!user) {
      appendLog('Sign in to save macros', 'error')
      return
    }
    setSaving(true)
    const saved = await persistMacro({ id: macroId, title: title || 'Untitled', description, code })
    setSaving(false)
    if (saved) {
      appendLog('Macro saved', 'success')
      router.push('/dashboard')
    } else {
      appendLog('Failed to save macro', 'error')
    }
  }

  async function handleRun() {
    const { steps, loopCount } = parseMacro(code)
    if (steps.length === 0) {
      appendLog('No steps to run (empty or all comments)', 'warn')
      return
    }

    setRunning(true)
    const loopLabel = loopCount > 1 ? ` (${loopCount} loops)` : ''
    appendLog(`=== starting sequence${loopLabel} ===`, 'info')

    if (demoMode) {
      for (let loop = 0; loop < loopCount; loop++) {
        if (loopCount > 1) appendLog(`--- loop ${loop + 1}/${loopCount} ---`, 'info')
        for (let i = 0; i < steps.length; i++) {
          const s = steps[i]
          appendLog(`> demo #${i}: ${s.cmd}`, 'info')
          await new Promise(r => setTimeout(r, s.delay || 100))
          appendLog(`< demo done #${i}`, 'success')
        }
      }
      appendLog('=== demo finished ===', 'success')
      setRunning(false)
      return
    }

    if (bridge.status === 'unavailable' || bridge.status === 'disconnected') {
      appendLog('Bridge not available. Enable demo mode or start the bridge.', 'error')
      setShowOnboard(true)
      setRunning(false)
      return
    }

    try {
      for (let loop = 0; loop < loopCount; loop++) {
        if (loopCount > 1) appendLog(`--- loop ${loop + 1}/${loopCount} ---`, 'info')
        await bridge.runSequence(steps)
      }
    } catch (e) {
      appendLog('Failed to run: ' + String(e), 'error')
      setRunning(false)
    }
  }

  function handleStop() {
    bridge.stop()
    appendLog('=== stop requested ===', 'warn')
    setRunning(false)
  }

  const { bindings, updateBinding, resetDefaults } = useShortcuts({
    run: () => { if (!running) handleRun() },
    save: () => handleSave(),
    stop: () => { if (running) handleStop() },
    checkBridge: () => handleCheckBridge(),
    toggleDemo: () => setDemoMode(prev => !prev),
  })

  async function handleAssignHotkey(hotkey: { key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean }) {
    const { steps } = parseMacro(code)
    const id = macroId || 'current'
    try {
      await bridge.registerHotkey(id, hotkey, steps)
      setAssignedHotkey(hotkey)
      appendLog(`Hotkey registered: press it from Minecraft to run`, 'success')
    } catch {
      appendLog('Failed to register hotkey with bridge', 'error')
    }
  }

  async function handleClearHotkey() {
    const id = macroId || 'current'
    try {
      await bridge.unregisterHotkey(id)
      setAssignedHotkey(null)
      appendLog('Hotkey removed', 'info')
    } catch {}
  }

  function handleInsertExample(exampleCode: string) {
    setCode(exampleCode)
    setActiveTab('editor')
  }

  return (
    <main className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="border-b border-border/50 bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              &larr; Dashboard
            </Link>
            <span className="text-border">|</span>
            <h1 className="text-sm font-semibold text-text">
              {macroId ? 'Edit Macro' : 'New Macro'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-text-faint hidden sm:block">{user.email || user.id}</span>
            )}
            <button
              onClick={() => setShortcutsOpen(true)}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
              className="p-1.5 text-text-faint hover:text-text hover:bg-bg-hover rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content: two columns */}
      <div className="max-w-[1600px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          {/* LEFT: Editor */}
          <div className="space-y-0">
            {/* Tab bar */}
            <div className="flex border-b border-border bg-bg-surface rounded-t-xl">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors
                  ${activeTab === 'editor'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-muted hover:text-text'}`}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors
                  ${activeTab === 'examples'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-muted hover:text-text'}`}
              >
                Examples
              </button>
            </div>

            {/* Editor / Examples content */}
            <div className="bg-bg-surface border border-t-0 border-border rounded-b-xl overflow-hidden">
              {activeTab === 'editor' ? (
                <div style={{ height: 500 }}>
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="plaintext"
                    value={code}
                    onChange={v => setCode(v || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      padding: { top: 12 },
                    }}
                  />
                </div>
              ) : (
                <div className="h-[500px] overflow-auto">
                  <MacroExamplesTab onInsert={handleInsertExample} />
                </div>
              )}
            </div>

            {/* DSL reference */}
            <details className="mt-3 card">
              <summary className="text-sm font-medium text-text cursor-pointer hover:text-primary transition-colors">
                Macro DSL Reference
              </summary>
              <div className="mt-3 pt-3 border-t border-border text-xs text-text-muted space-y-1.5 font-mono">
                <p><code className="text-cyan">CHAT &lt;text&gt;</code> — Type text + Enter</p>
                <p><code className="text-cyan">KEY TAP|DOWN|UP &lt;key&gt;</code> — Keyboard input</p>
                <p><code className="text-cyan">MOUSE_MOVE &lt;x&gt; &lt;y&gt;</code> — Move cursor</p>
                <p><code className="text-cyan">MOUSE_CLICK left|right</code> — Mouse click</p>
                <p><code className="text-cyan">SCROLL &lt;dx&gt; &lt;dy&gt;</code> — Scroll wheel</p>
                <p><code className="text-sand">DELAY &lt;ms&gt;</code> — Pause</p>
                <p><code className="text-primary">LOOP &lt;n&gt;</code> — Repeat the whole macro n times</p>
                <p><code className="text-text-faint"># comment</code> — Lines starting with # are ignored</p>
              </div>
            </details>
          </div>

          {/* RIGHT: Controls */}
          <div className="space-y-3">
            <EditorHeader
              title={title}
              description={description}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
            />

            <BridgeStatus
              status={bridge.status}
              demoMode={demoMode}
              onCheck={handleCheckBridge}
              onToggleDemo={setDemoMode}
            />

            <ActionButtons
              running={running}
              saving={saving}
              onSave={handleSave}
              onRun={handleRun}
              onStop={handleStop}
            />

            <HotkeyAssign
              currentHotkey={assignedHotkey}
              onAssign={handleAssignHotkey}
              onClear={handleClearHotkey}
              bridgeAvailable={bridge.status === 'available'}
              hotkeysSupported={hotkeysSupported}
            />

            <MacroRecorder
              bridgeAvailable={bridge.status === 'available'}
              hotkeysSupported={hotkeysSupported}
              onStartRecording={bridge.startRecording}
              onStopRecording={bridge.stopRecording}
              onInsert={(recorded) => { setCode(recorded); setActiveTab('editor') }}
              onBridgeMessage={bridge.addMessageListener}
              offBridgeMessage={bridge.removeMessageListener}
            />

            {showOnboard && (
              <OnboardPanel
                onEnableDemo={() => { setDemoMode(true); setShowOnboard(false) }}
                onCheckBridge={handleCheckBridge}
              />
            )}

            <ExecutionLog
              entries={logs}
              onClear={() => setLogs([])}
            />
          </div>
        </div>
      </div>

      <ShortcutSettings
        bindings={bindings}
        onUpdate={updateBinding}
        onReset={resetDefaults}
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </main>
  )
}
