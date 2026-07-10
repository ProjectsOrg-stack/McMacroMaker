'use client'

interface MacroExamplesTabProps {
  onInsert: (code: string) => void
}

const EXAMPLES = [
  {
    name: 'Say Hello',
    description: 'Send a chat message',
    code: 'CHAT /say Hello from McMacroMaker!',
  },
  {
    name: 'Open Inventory',
    description: 'Open and close inventory with delay',
    code: `KEY TAP e\nDELAY 500\nKEY TAP e`,
  },
  {
    name: 'Auto-Click',
    description: 'Move mouse to center and click',
    code: `MOUSE_MOVE 960 540\nDELAY 100\nMOUSE_CLICK left\nDELAY 100\nMOUSE_CLICK left`,
  },
  {
    name: 'Sprint Jump',
    description: 'Hold sprint key and jump',
    code: `# Sprint forward and jump\nKEY DOWN w\nKEY DOWN control\nDELAY 100\nKEY TAP space\nDELAY 300\nKEY UP control\nKEY UP w`,
  },
  {
    name: 'Scroll Hotbar',
    description: 'Scroll through hotbar slots',
    code: `SCROLL 0 3\nDELAY 200\nSCROLL 0 -3`,
  },
]

export function MacroExamplesTab({ onInsert }: MacroExamplesTabProps) {
  return (
    <div className="space-y-2 p-3">
      <p className="text-xs text-muted mb-2">Click an example to insert it into the editor.</p>
      {EXAMPLES.map((ex, i) => (
        <button
          key={i}
          onClick={() => onInsert(ex.code)}
          className="w-full text-left p-2.5 border border-gray-200 rounded-lg
                     hover:border-primary/40 hover:bg-blue-50/50 transition-colors group"
        >
          <div className="text-sm font-medium text-gray-800 group-hover:text-primary">
            {ex.name}
          </div>
          <div className="text-xs text-muted mt-0.5">{ex.description}</div>
          <pre className="text-[10px] text-gray-500 mt-1 font-mono whitespace-pre-wrap">
            {ex.code}
          </pre>
        </button>
      ))}
    </div>
  )
}
