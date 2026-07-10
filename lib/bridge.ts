export type BridgeMessageHandler = (msg: any) => void

export class Bridge {
  url: string
  socket: WebSocket | null = null
  messageHandlers: BridgeMessageHandler[] = []

  constructor(url?: string) {
    this.url = url || process.env.NEXT_PUBLIC_BRIDGE_URL || 'ws://127.0.0.1:8080'
  }

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return
    try {
      this.socket = new WebSocket(this.url)
    } catch {
      this.socket = null
      return
    }
    this.socket.addEventListener('message', (ev) => {
      for (const h of this.messageHandlers) h(ev.data)
    })
    this.socket.addEventListener('close', () => { /* no-op */ })
    this.socket.addEventListener('error', () => { /* no-op */ })
  }

  disconnect() {
    try { this.socket?.close() } catch {}
    this.socket = null
  }

  onMessage(fn: BridgeMessageHandler) {
    this.messageHandlers.push(fn)
  }

  offMessage(fn: BridgeMessageHandler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== fn)
  }

  sendRaw(obj: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.connect()
      if (!this.socket) return reject(new Error('No socket'))
      const s = JSON.stringify(obj)
      const onOpen = () => {
        try {
          this.socket!.send(s)
          resolve()
        } catch (e) {
          reject(e)
        }
      }
      if (this.socket.readyState === WebSocket.OPEN) return onOpen()
      this.socket.addEventListener('open', onOpen, { once: true })
      this.socket.addEventListener('error', (ev) => reject(ev), { once: true })
    })
  }

  sendSequence(steps: Array<{ cmd: string; delay?: number }>) {
    return this.sendRaw({ type: 'sequence', steps })
  }

  stop() {
    try { this.sendRaw({ type: 'stop' }) } catch { /* ignore */ }
  }

  ping(timeoutMs = 1500): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let settled = false
      const onMsg = (raw: any) => {
        try {
          const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
          if (obj && obj.event === 'pong') {
            settled = true
            resolve(obj)
            this.offMessage(onMsg)
          }
        } catch { /* ignore */ }
      }
      this.onMessage(onMsg)
      this.sendRaw({ type: 'ping' }).catch(() => {
        if (!settled) {
          settled = true
          this.offMessage(onMsg)
          reject(new Error('no socket'))
        }
      })
      setTimeout(() => {
        if (settled) return
        settled = true
        this.offMessage(onMsg)
        reject(new Error('timeout'))
      }, timeoutMs)
    })
  }
}

export default Bridge
