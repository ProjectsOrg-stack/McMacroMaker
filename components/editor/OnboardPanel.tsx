'use client'

import { useState } from 'react'

interface OnboardPanelProps {
  onEnableDemo: () => void
  onCheckBridge: () => void
}

export function OnboardPanel({ onEnableDemo, onCheckBridge }: OnboardPanelProps) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* no-op */ }
  }

  const oneLiner = 'npx degit ProjectsOrg-stack/McMacroMaker/bridge bridge && cd bridge && npm install && npm start'

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-amber-900">Bridge not detected</h3>
        <p className="text-xs text-amber-800 mt-1">
          The bridge is a small local server that sends keyboard/mouse input to Minecraft.
          Set it up below, or use <strong>Demo mode</strong> to test macros in the browser without installing anything.
        </p>
      </div>

      <div className="bg-white border border-amber-200 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-gray-700">Setup (one command, Node 18+ required):</p>
        <p className="text-[10px] text-gray-500">
          Open a terminal and paste this — it downloads only the bridge, installs dependencies, and starts it:
        </p>
        <div className="flex items-start gap-2">
          <code className="flex-1 text-xs bg-gray-50 p-2 rounded font-mono break-all select-all">
            {oneLiner}
          </code>
          <button
            onClick={() => copyText(oneLiner, 'oneliner')}
            aria-label="Copy install command"
            className="shrink-0 px-2 py-1 text-xs border border-gray-300 rounded
                       hover:bg-gray-50 transition-colors"
          >
            {copied === 'oneliner' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-[10px] text-gray-500">
          You should see <code className="bg-gray-100 px-1 rounded">Bridge listening at ws://127.0.0.1:8080</code> — then come back here and click Check.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <h4 className="text-xs font-semibold mb-1">macOS</h4>
          <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-0.5">
            <li>Install <a href="https://nodejs.org" className="text-primary hover:underline" target="_blank" rel="noopener">Node.js</a> (v18+, v26 works)</li>
            <li>Run <code className="text-[10px] bg-gray-100 px-1 rounded">xcode-select --install</code> if prompted</li>
            <li>Run the command above in Terminal</li>
            <li>Grant Accessibility: <strong>System Settings &gt; Privacy &amp; Security &gt; Accessibility</strong> &gt; add Terminal</li>
          </ol>
          <button
            onClick={() => copyText(oneLiner, 'mac')}
            className="mt-2 text-xs text-primary hover:underline"
          >
            {copied === 'mac' ? 'Copied!' : 'Copy command'}
          </button>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <h4 className="text-xs font-semibold mb-1">Windows</h4>
          <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-0.5">
            <li>Install <a href="https://nodejs.org" className="text-primary hover:underline" target="_blank" rel="noopener">Node.js</a> (v18+)</li>
            <li>Install <a href="https://visualstudio.microsoft.com/visual-cpp-build-tools/" className="text-primary hover:underline" target="_blank" rel="noopener">VS Build Tools</a> if robotjs needs to compile</li>
            <li>Run the command above in Command Prompt or PowerShell</li>
            <li>Run as Administrator if input doesn't work</li>
          </ol>
          <button
            onClick={() => copyText(oneLiner, 'win')}
            className="mt-2 text-xs text-primary hover:underline"
          >
            {copied === 'win' ? 'Copied!' : 'Copy command'}
          </button>
        </div>
      </div>

      <div className="p-2 bg-amber-100/50 border border-amber-200 rounded text-[10px] text-amber-800">
        <strong>Important:</strong> Keep Minecraft in the foreground (focused) while macros run — the bridge sends real keyboard/mouse input to whatever window is active.
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCheckBridge}
          className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg
                     hover:bg-primary-600 transition-colors"
        >
          I started it — check connection
        </button>
        <button
          onClick={onEnableDemo}
          className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg
                     hover:bg-gray-50 transition-colors"
        >
          Use demo mode instead
        </button>
      </div>
    </div>
  )
}
