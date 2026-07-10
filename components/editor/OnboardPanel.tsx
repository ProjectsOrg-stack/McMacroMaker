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
          Run macros locally by starting the bridge, or use Demo mode to test in the browser.
        </p>
      </div>

      <div className="bg-white border border-amber-200 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-700 mb-2">Quick start (Node 18+ required):</p>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <h4 className="text-xs font-semibold mb-1">macOS</h4>
          <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-0.5">
            <li>Install Node.js (v18+)</li>
            <li><code className="text-[10px] bg-gray-100 px-1 rounded">xcode-select --install</code></li>
            <li>Run the one-liner above</li>
            <li>Grant Accessibility in System Settings</li>
          </ol>
          <button
            onClick={() => copyText('cd bridge && npm install && npm start', 'mac')}
            className="mt-2 text-xs text-primary hover:underline"
          >
            {copied === 'mac' ? 'Copied!' : 'Copy commands'}
          </button>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <h4 className="text-xs font-semibold mb-1">Windows</h4>
          <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-0.5">
            <li>Install Node.js (v18+)</li>
            <li>Install VS Build Tools if needed</li>
            <li>Run the one-liner above</li>
            <li>Run terminal as Administrator</li>
          </ol>
          <button
            onClick={() => copyText('cd bridge && npm install && npm start', 'win')}
            className="mt-2 text-xs text-primary hover:underline"
          >
            {copied === 'win' ? 'Copied!' : 'Copy commands'}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCheckBridge}
          className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg
                     hover:bg-primary-600 transition-colors"
        >
          I installed it — check connection
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
