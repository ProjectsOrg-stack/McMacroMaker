import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExecutionLog } from '../components/editor/ExecutionLog'
import type { LogEntry } from '../lib/types'

describe('ExecutionLog', () => {
  const entries: LogEntry[] = [
    { timestamp: '10:00:00', message: 'Starting', level: 'info' },
    { timestamp: '10:00:01', message: 'Step done', level: 'success' },
    { timestamp: '10:00:02', message: 'Something failed', level: 'error' },
  ]

  it('renders log entries', () => {
    render(<ExecutionLog entries={entries} onClear={() => {}} />)
    expect(screen.getByText('Starting')).toBeTruthy()
    expect(screen.getByText('Step done')).toBeTruthy()
    expect(screen.getByText('Something failed')).toBeTruthy()
  })

  it('shows empty state when no entries', () => {
    render(<ExecutionLog entries={[]} onClear={() => {}} />)
    expect(screen.getByText('No activity yet')).toBeTruthy()
  })

  it('filters by error', () => {
    render(<ExecutionLog entries={entries} onClear={() => {}} />)
    fireEvent.click(screen.getByText('Error'))
    expect(screen.getByText('Something failed')).toBeTruthy()
    expect(screen.queryByText('Starting')).toBeNull()
  })

  it('calls onClear when clear button clicked', () => {
    const onClear = vi.fn()
    render(<ExecutionLog entries={entries} onClear={onClear} />)
    fireEvent.click(screen.getByLabelText('Clear logs'))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('has aria-live region', () => {
    render(<ExecutionLog entries={entries} onClear={() => {}} />)
    const log = screen.getByRole('log')
    expect(log.getAttribute('aria-live')).toBe('polite')
  })
})
