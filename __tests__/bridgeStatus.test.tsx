import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BridgeStatus } from '../components/editor/BridgeStatus'

describe('BridgeStatus', () => {
  it('shows Connected when available', () => {
    render(<BridgeStatus status="available" demoMode={false} onCheck={() => {}} onToggleDemo={() => {}} />)
    expect(screen.getByText('Bridge: Connected')).toBeTruthy()
  })

  it('shows Not Available when unavailable', () => {
    render(<BridgeStatus status="unavailable" demoMode={false} onCheck={() => {}} onToggleDemo={() => {}} />)
    expect(screen.getByText('Bridge: Not Available')).toBeTruthy()
  })

  it('shows Connecting when connecting', () => {
    render(<BridgeStatus status="connecting" demoMode={false} onCheck={() => {}} onToggleDemo={() => {}} />)
    expect(screen.getByText('Bridge: Connecting...')).toBeTruthy()
  })

  it('calls onCheck when Check button clicked', () => {
    const onCheck = vi.fn()
    render(<BridgeStatus status="disconnected" demoMode={false} onCheck={onCheck} onToggleDemo={() => {}} />)
    fireEvent.click(screen.getByText('Check'))
    expect(onCheck).toHaveBeenCalledOnce()
  })

  it('calls onToggleDemo when checkbox toggled', () => {
    const onToggle = vi.fn()
    render(<BridgeStatus status="disconnected" demoMode={false} onCheck={() => {}} onToggleDemo={onToggle} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('checkbox reflects demoMode prop', () => {
    render(<BridgeStatus status="disconnected" demoMode={true} onCheck={() => {}} onToggleDemo={() => {}} />)
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true)
  })
})
