'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '../../components/AuthProvider'
import { useBridge } from '../../hooks/useBridge'
import { useMacros } from '../../hooks/useMacros'
import { parseLinesToSteps, DEFAULT_MACRO } from '../../lib/parser'
import type { LogEntry } from '../../lib/types'

import { EditorHeader } from '../../components/editor/EditorHeader'
import { BridgeStatus } from '../../components/editor/BridgeStatus'
import { ActionButtons } from '../../components/editor/ActionButtons'
import { OnboardPanel } from '../../components/editor/OnboardPanel'
import { ExecutionLog } from '../../components/editor/ExecutionLog'
import { MacroExamplesTab } from '../../components/editor/MacroExamplesTab'

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
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [demoMode, setDemoMode] = useState(
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  )
  const [showOnboard, setShowOnboard] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'examples'>('editor')
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

  // Load macro from localStorage on first render
  if (!loadedRef.current && user && macroId) {
    loadedRef.current = true
    const found = getMacro(macroId)
    if (found) {
      setTitle(found.title)
      setDescription(found.description)
      setCode(found.code)
    }
  }

  async function handleCheckBridge() {
    try {
      await bridge.checkBridge()
      setShowOnboard(false)
    } catch {
      setShowOnboard(true)
    }
  }

  function handleSave() {
    if (!user) {
      appendLog('Sign in to save macros', 'error')
      return
    }
    persistMacro({ id: macroId, title: title || 'Untitled', description, code })
    appendLog('Macro saved', 'success')
    router.push('/dashboard')
  }

  async function handleRun() {
    const steps = parseLinesToSteps(code)
    if (steps.length === 0) {
      appendLog('No steps to run (empty or all comments)', 'warn')
      return
    }

    setRunning(true)
    appendLog('=== starting sequence ===', 'info')

    if (demoMode) {
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i]
        appendLog(`> demo #${i}: ${s.cmd}`, 'info')
        await new Promise(r => setTimeout(r, s.delay || 100))
        appendLog(`< demo done #${i}`, 'success')
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
      await bridge.runSequence(steps)
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

  function handleInsertExample(exampleCode: string) {
    setCode(exampleCode)
    setActiveTab('editor')
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="text-sm text-muted hover:text-gray-800 transition-colors"
              aria-label="Back to dashboard"
            >
              &larr; Dashboard
            </a>
            <span className="text-gray-300">|</span>
            <h1 className="text-base font-semibold text-gray-900">
              {macroId ? 'Edit Macro' : 'New Macro'}
            </h1>
          </div>
          {user && (
            <span className="text-xs text-muted">{user.email || user.id}</span>
          )}
        </div>
      </header>

      {/* Main content: two columns */}
      <div className="max-w-[1600px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          {/* LEFT: Editor */}
          <div className="space-y-0">
            {/* Tab bar */}
            <div className="flex border-b border-gray-200 bg-white rounded-t-lg">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors
                  ${activeTab === 'editor'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted hover:text-gray-700'}`}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors
                  ${activeTab === 'examples'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted hover:text-gray-700'}`}
              >
                Examples
              </button>
            </div>

            {/* Editor / Examples content */}
            <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
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
            <details className="mt-3 bg-white border border-gray-200 rounded-lg">
              <summary className="px-4 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
                Macro DSL Reference
              </summary>
              <div className="px-4 pb-3 text-xs text-gray-600 space-y-1 font-mono">
                <p><code className="text-primary">CHAT &lt;text&gt;</code> — Type text + Enter</p>
                <p><code className="text-primary">KEY TAP|DOWN|UP &lt;key&gt;</code> — Keyboard input</p>
                <p><code className="text-primary">MOUSE_MOVE &lt;x&gt; &lt;y&gt;</code> — Move cursor</p>
                <p><code className="text-primary">MOUSE_CLICK left|right</code> — Mouse click</p>
                <p><code className="text-primary">SCROLL &lt;dx&gt; &lt;dy&gt;</code> — Scroll wheel</p>
                <p><code className="text-primary">DELAY &lt;ms&gt;</code> — Pause</p>
                <p><code className="text-muted"># comment</code> — Lines starting with # are ignored</p>
              </div>
            </details>
          </div>

          {/* RIGHT: Controls */}
          <div className="space-y-4">
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
              onSave={handleSave}
              onRun={handleRun}
              onStop={handleStop}
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
    </main>
  )
}
