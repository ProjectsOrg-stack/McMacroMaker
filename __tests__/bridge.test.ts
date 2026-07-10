import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Bridge } from '../lib/bridge'

class MockWebSocket {
  static OPEN = 1
  static CONNECTING = 0
  readyState = 0
  listeners: Record<string, Function[]> = {}

  constructor() {
    setTimeout(() => {
      this.readyState = 1
      this.emit('open', {})
    }, 10)
  }

  addEventListener(event: string, fn: Function, opts?: any) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(fn)
  }

  removeEventListener(event: string, fn: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(f => f !== fn)
    }
  }

  send(data: string) {}

  close() {
    this.readyState = 3
  }

  emit(event: string, data: any) {
    for (const fn of this.listeners[event] || []) fn(data)
  }
}

beforeEach(() => {
  (globalThis as any).WebSocket = MockWebSocket as any
  ;(globalThis as any).WebSocket.OPEN = 1
})

describe('Bridge', () => {
  it('creates with default url', () => {
    const b = new Bridge()
    expect(b.url).toBe('ws://127.0.0.1:8080')
  })

  it('creates with custom url', () => {
    const b = new Bridge('ws://localhost:9090')
    expect(b.url).toBe('ws://localhost:9090')
  })

  it('registers and calls message handlers', () => {
    const b = new Bridge()
    const handler = vi.fn()
    b.onMessage(handler)
    expect(b.messageHandlers).toHaveLength(1)
  })

  it('removes message handlers with offMessage', () => {
    const b = new Bridge()
    const handler = vi.fn()
    b.onMessage(handler)
    b.offMessage(handler)
    expect(b.messageHandlers).toHaveLength(0)
  })

  it('disconnect sets socket to null', () => {
    const b = new Bridge()
    b.connect()
    expect(b.socket).not.toBeNull()
    b.disconnect()
    expect(b.socket).toBeNull()
  })

  it('sendSequence sends correct message', async () => {
    const b = new Bridge()
    const sendSpy = vi.fn()

    b.connect()
    await new Promise(r => setTimeout(r, 20))

    b.socket!.send = sendSpy

    await b.sendSequence([{ cmd: 'CHAT hello', delay: 100 }])
    expect(sendSpy).toHaveBeenCalledWith(
      JSON.stringify({ type: 'sequence', steps: [{ cmd: 'CHAT hello', delay: 100 }] })
    )
  })

  it('ping resolves when pong received', async () => {
    const b = new Bridge()
    b.connect()
    await new Promise(r => setTimeout(r, 20))

    b.socket!.send = () => {
      setTimeout(() => {
        (b.socket as any).emit('message', { data: JSON.stringify({ event: 'pong', ready: true, platform: 'test' }) })
      }, 10)
    }

    const pong = await b.ping(500)
    expect(pong.event).toBe('pong')
    expect(pong.ready).toBe(true)
  })

  it('ping rejects on timeout', async () => {
    const b = new Bridge()
    b.connect()
    await new Promise(r => setTimeout(r, 20))

    b.socket!.send = () => {}

    await expect(b.ping(50)).rejects.toThrow('timeout')
  })
})
