export type BridgeStatus = 'disconnected' | 'connecting' | 'available' | 'unavailable'

export type BridgeMessageEvent = 'pong' | 'stepStart' | 'stepDone' | 'done' | 'error' | 'stopped'

export type BridgeMessage = {
  event: BridgeMessageEvent
  [k: string]: any
}

export interface MacroStep {
  cmd: string
  delay?: number
}

export interface Macro {
  id: string
  title: string
  description: string
  code: string
  created_at: string
  updated_at: string
}

export type LogLevel = 'info' | 'error' | 'success' | 'warn'

export interface LogEntry {
  timestamp: string
  message: string
  level: LogLevel
}
