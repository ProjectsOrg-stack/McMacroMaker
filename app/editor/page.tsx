'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '../../components/AuthProvider'
import { v4 as uuidv4 } from 'uuid'
import Bridge from '../../lib/bridge'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export default function EditorPage() {
  const params = useSearchParams()
  const id = params?.get('id')
  const router = useRouter()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('/say hello')
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const [bridgeAvailable, setBridgeAvailable] = useState<boolean | null>(null)
  const [showOnboard, setShowOnboard] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  const bridgeRef = useRef<Bridge | null>(null)

  useEffect(() => {
    // init bridge
    const br = new Bridge()
    bridgeRef.current = br

    // runtime-safe registration: guard & cast against incorrect import/export shapes
    if (typeof (br as any).onMessage === 'function') {
      ;(br as any).onMessage((msg: any) => {
        try {
          const obj = typeof msg === 'string' ? JSON.parse(msg) : msg
          if (obj.event === 'stepStart') appendLog(`> start #${obj.index}: ${obj.cmd}`)
          else if (obj.event === 'stepDone') appendLog(`< done #${obj.index}`)
          else if (obj.event === 'error') appendLog(`! error: ${obj.error}`)
          else if (obj.event === 'done') {
            appendLog('=== sequence finished ===')
            setRunning(false)
          } else if (obj.event === 'pong') {
            appendLog(`bridge pong: ready=${obj.ready} platform=${obj.platform || 'unknown'}`)
            setBridgeAvailable(Boolean(obj.ready))
          }
        } catch (e) {
          appendLog(String(msg))
        }
      })
    } else {
      console.warn('Bridge onMessage missing or not a function', br)
      setBridgeAvailable(false)
      setShowOnboard(true)
    }

    // probe bridge on mount
    (async () => {
      try {
        const res = await (br as any).ping(1200)
        setBridgeAvailable(Boolean(res?.ready))
      } catch (e) {
        setBridgeAvailable(false)
        setShowOnboard(true)
      }
    })()

    return () => {
      try { (br as any).disconnect() } catch {}
      bridgeRef.current = null
    }
  }, [])

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

  function appendLog(line: string) {
    setLog((l) => [...l, `${new Date().toLocaleTimeString()} ${line}`])
  }

  function parseLinesToSteps(codeText: string) {
    const lines = codeText.split('\n')
      .map(l => l.trim())
      .filter(Boolean)
    const steps: Array<{ cmd: string; delay?: number }> = []
    for (const ln of lines) {
      // If line starts with DELAY <ms>, convert to a step with only delay
      const parts = ln.split(/\s+/)
      if (parts[0].toUpperCase() === 'DELAY') {
        const ms = parseInt(parts[1] || '0', 10) || 0
        steps.push({ cmd: `DELAY ${ms}`, delay: ms })
      } else {
        // default delay after a command (can be adjusted or set to 0)
        steps.push({ cmd: ln, delay: 100 })
      }
    }
    return steps
  }

  async function runMacro() {
    const steps = parseLinesToSteps(code)
    appendLog('=== starting sequence ===')
    setRunning(true)

    if (demoMode) {
      // Simulate execution locally without sending OS events
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i]
        appendLog(`> demo start #${i}: ${s.cmd}`)
        await new Promise(r => setTimeout(r, s.delay || 100))
        appendLog(`< demo done #${i}`)
      }
      appendLog('=== demo finished ===')
      setRunning(false)
      return
    }

    if (!bridgeRef.current) return alert('Bridge unavailable')
    if (bridgeAvailable === false) {
      setShowOnboard(true)
      setRunning(false)
      return
    }

    try {
      await (bridgeRef.current as any).sendSequence(steps)
      // bridge will emit done event; keep running state until then
    } catch (e) {
      appendLog('Failed to run macro: ' + String(e))
      setRunning(false)
    }
  }

  function stopMacro() {
    (bridgeRef.current as any)?.stop()
    appendLog('=== stop requested ===')
    setRunning(false)
  }

  async function checkBridge() {
    try {
      setBridgeAvailable(null)
      const res = await (bridgeRef.current as any)!.ping(1200)
      setBridgeAvailable(Boolean(res?.ready))
      if (!res?.ready) setShowOnboard(true)
    } catch (e) {
      setBridgeAvailable(false)
      setShowOnboard(true)
    }
  }

  async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); appendLog('Copied install command') } catch { /* no-op */ }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-4 mb-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Macro title" className="flex-1 p-2 border rounded" />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" className="w-96 p-2 border rounded" />
        </div>
        <div className="flex items-center gap-4 mb-2">
          <div>Bridge status: {bridgeAvailable === null ? 'checking...' : bridgeAvailable ? 'available' : 'not available'}</div>
          <button onClick={checkBridge} className="px-2 py-1 border rounded">Check bridge</button>
          <label className="ml-auto inline-flex items-center gap-2"><input type="checkbox" checked={demoMode} onChange={(e)=>setDemoMode(e.target.checked)} /> Demo mode</label>
        </div>

        <div style={{ height: 400 }} className="border">
          <MonacoEditor height="100%" defaultLanguage="plaintext" value={code} onChange={(v) => setCode(v || '')} />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={saveMacro} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
          <button onClick={runMacro} disabled={running} className="px-3 py-1 bg-green-600 text-white rounded">Run</button>
          <button onClick={stopMacro} disabled={!running} className="px-3 py-1 bg-red-600 text-white rounded">Stop</button>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Execution Log</h3>
          <div className="h-48 overflow-auto p-2 border bg-black text-white text-xs">
            {log.length === 0 ? <div className="text-gray-400">No activity yet</div> : log.map((l, i) => <div key={i} className="whitespace-pre-wrap">{l}</div>)}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>Macro DSL: one command per line. Special line: <code>DELAY &lt;ms&gt;</code> sets a pause. Examples:</p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">CHAT /say Hello\nDELAY 200\nKEY TAP e\nMOUSE_MOVE 960 540\nMOUSE_CLICK left</pre>
        </div>
      </div>

      {showOnboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded max-w-2xl w-full">
            <h2 className="text-lg font-bold mb-2">Local bridge not detected</h2>
            <p className="mb-4">To run macros that simulate mouse/keyboard you need a small local bridge running on your computer. Choose your platform and follow the steps below. You can also try demo mode to simulate execution in the browser.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded">
                <h3 className="font-semibold">macOS (recommended)</h3>
                <ol className="list-decimal pl-5 mt-2 text-sm">
                  <li>Install Node.js (v18+). Use <code>brew install node</code> or from nodejs.org.</li>
                  <li>Install build tools: <code>xcode-select --install</code></li>
                  <li>Open a terminal and run:</li>
                </ol>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-2">cd {`<repo-root>/bridge`}\nnpm install\nnpm start</pre>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => copyToClipboard(`cd bridge && npm install && npm start`)} className="px-2 py-1 border rounded text-sm">Copy commands</button>
                </div>
                <p className="text-xs mt-2">Grant Accessibility: System Settings → Privacy & Security → Accessibility → add Terminal or Node.</p>
              </div>

              <div className="p-3 border rounded">
                <h3 className="font-semibold">Windows</h3>
                <ol className="list-decimal pl-5 mt-2 text-sm">
                  <li>Install Node.js (v18+).</li>
                  <li>Open a Developer Command Prompt if robotjs needs build tools (install Build Tools for Visual Studio).</li>
                  <li>Run:</li>
                </ol>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-2">cd bridge\nnpm install\nnpm start</pre>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => copyToClipboard(`cd bridge && npm install && npm start`)} className="px-2 py-1 border rounded text-sm">Copy commands</button>
                </div>
                <p className="text-xs mt-2">You may need to run the terminal as Administrator for input access or driver installs.</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => { setShowOnboard(false); }} className="px-3 py-1 border rounded">Close</button>
              <button onClick={() => checkBridge()} className="px-3 py-1 bg-blue-600 text-white rounded">I installed it, check connection</button>
              <button onClick={() => { setDemoMode(true); setShowOnboard(false); }} className="px-3 py-1 bg-gray-700 text-white rounded">Use demo mode</button>
            </div>

          </div>
        </div>
      )}
    </main>
  )
}
