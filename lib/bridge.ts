export class Bridge {
  url = 'ws://localhost:8080'
  socket: WebSocket | null = null

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return
    this.socket = new WebSocket(this.url)
  }

  send(message: string) {
    return new Promise<void>((resolve, reject) => {
      this.connect()
      if (!this.socket) return reject(new Error('No socket'))
      const onOpen = () => {
        try {
          this.socket!.send(message)
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
}
