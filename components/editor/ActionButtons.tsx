'use client'

interface ActionButtonsProps {
  running: boolean
  onSave: () => void
  onRun: () => void
  onStop: () => void
}

export function ActionButtons({ running, onSave, onRun, onStop }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onSave}
        aria-label="Save macro"
        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg
                   hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/40
                   transition-colors"
      >
        <span className="flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save
        </span>
      </button>
      <button
        onClick={onRun}
        disabled={running}
        aria-label="Run macro"
        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-success rounded-lg
                   hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-success/40
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {running ? 'Running...' : 'Run'}
        </span>
      </button>
      <button
        onClick={onStop}
        disabled={!running}
        aria-label="Stop macro"
        className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg
                   hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-danger/40
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          Stop
        </span>
      </button>
    </div>
  )
}
