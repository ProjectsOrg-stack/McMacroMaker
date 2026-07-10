'use client'

interface ActionButtonsProps {
  running: boolean
  saving?: boolean
  onSave: () => void
  onRun: () => void
  onStop: () => void
}

export function ActionButtons({ running, saving, onSave, onRun, onStop }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onSave}
        disabled={saving}
        aria-label="Save macro"
        className="btn-primary flex-1"
      >
        <span className="flex items-center justify-center gap-1.5">
          {saving ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          )}
          {saving ? 'Saving...' : 'Save'}
        </span>
      </button>
      <button
        onClick={onRun}
        disabled={running}
        aria-label="Run macro"
        className="btn-accent flex-1"
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
        className="btn-danger"
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
