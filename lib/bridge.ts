export class Bridge {
  url = 'ws://127.0.0.1:8080'
  socket: WebSocket | null = null
  messageHandlers: Array<(msg: any) => void> = []

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return
    try {
      this.socket = new WebSocket(this.url)
    } catch (e) {
      this.socket = null
      return
    }
    this.socket.addEventListener('message', (ev) => {
      const data = ev.data
      for (const h of this.messageHandlers) h(data)
    })
    this.socket.addEventListener('close', () => { /* no-op */ })
    this.socket.addEventListener('error', () => { /* no-op */ })
  }

  disconnect() {
    try {
      this.socket?.close()
    } catch {}
    this.socket = null
  }

  onMessage(fn: (msg: any) => void) {
    this.messageHandlers.push(fn)
  }

  sendRaw(obj: any) {
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
    try { this.sendRaw({ type: 'stop' }) } catch (e) { /* ignore */ }
  }

  ping(timeoutMs = 1500) {
    return new Promise<any>((resolve, reject) => {
      let settled = false
      const onMsg = (raw: any) => {
        try {
          const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
          if (obj && obj.event === 'pong') {
            settled = true
            resolve(obj)
            // remove this handler
            this.messageHandlers = this.messageHandlers.filter(h => h !== onMsg)
          }
        } catch (e) {
          // ignore
        }
      }
      this.onMessage(onMsg)
      this.sendRaw({ type: 'ping' }).catch(() => {
        if (!settled) {
          settled = true
          this.messageHandlers = this.messageHandlers.filter(h => h !== onMsg)
          reject(new Error('no socket'))
        }
      })
      setTimeout(() => {
        if (settled) return
        settled = true
        this.messageHandlers = this.messageHandlers.filter(h => h !== onMsg)
        reject(new Error('timeout'))
      }, timeoutMs)
    })
  }
}

// Provide a default export so consumers can import either style.
export default Bridge
