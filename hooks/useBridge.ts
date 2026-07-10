'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Bridge from '../lib/bridge'
import type { BridgeStatus, LogEntry } from '../lib/types'

const DEFAULT_BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'ws://127.0.0.1:8080'

export function useBridge(onLog?: (entry: LogEntry) => void) {
  const ref = useRef<Bridge | null>(null)
  const [status, setStatus] = useState<BridgeStatus>('disconnected')
  const [lastPong, setLastPong] = useState<any>(null)
  const onLogRef = useRef(onLog)
  onLogRef.current = onLog

  const log = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    onLogRef.current?.({
      timestamp: new Date().toLocaleTimeString(),
      message,
      level,
    })
  }, [])

  const ensure = useCallback(() => {
    if (!ref.current) {
      ref.current = new Bridge(DEFAULT_BRIDGE_URL)
    }
    return ref.current
  }, [])

  const attachListener = useCallback((br: Bridge) => {
    br.onMessage((raw: any) => {
      try {
        const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (obj.event === 'stepStart') log(`> step #${obj.index}: ${obj.cmd}`, 'info')
        else if (obj.event === 'stepDone') log(`< done #${obj.index}`, 'success')
        else if (obj.event === 'error') log(`error: ${obj.error}`, 'error')
        else if (obj.event === 'done') log('sequence finished', 'success')
        else if (obj.event === 'stopped') log('stopped by user', 'warn')
        else if (obj.event === 'pong') {
          log(`pong: ready=${obj.ready} platform=${obj.platform || 'unknown'}`, 'info')
          setLastPong(obj)
          setStatus(obj.ready ? 'available' : 'unavailable')
        }
      } catch {
        log(String(raw), 'info')
      }
    })
  }, [log])

  const checkBridge = useCallback(async (timeoutMs = 1200): Promise<any> => {
    setStatus('connecting')
    log('Checking bridge...', 'info')
    const br = ensure()

    if (br.messageHandlers.length === 0) {
      attachListener(br)
    }

    try {
      const pong = await br.ping(timeoutMs)
      setLastPong(pong)
      setStatus(pong?.ready ? 'available' : 'unavailable')
      return pong
    } catch {
      setStatus('unavailable')
      throw new Error('Bridge not available')
    }
  }, [ensure, attachListener, log])

  const runSequence = useCallback(async (steps: Array<{ cmd: string; delay?: number }>) => {
    const br = ensure()
    if (br.messageHandlers.length === 0) {
      attachListener(br)
    }
    return br.sendSequence(steps)
  }, [ensure, attachListener])

  const stopExecution = useCallback(() => {
    ref.current?.stop()
  }, [])

  const sendRaw = useCallback(async (obj: any) => {
    const br = ensure()
    return br.sendRaw(obj)
  }, [ensure])

  const registerHotkey = useCallback(async (id: string, hotkey: any, steps: Array<{ cmd: string; delay?: number }>) => {
    const br = ensure()
    if (br.messageHandlers.length === 0) attachListener(br)
    return br.sendRaw({ type: 'register', id, hotkey, steps })
  }, [ensure, attachListener])

  const unregisterHotkey = useCallback(async (id: string) => {
    const br = ensure()
    return br.sendRaw({ type: 'unregister', id })
  }, [ensure])

  const startRecording = useCallback(async () => {
    const br = ensure()
    if (br.messageHandlers.length === 0) attachListener(br)
    return br.sendRaw({ type: 'startRecording' })
  }, [ensure, attachListener])

  const stopRecording = useCallback(async () => {
    const br = ensure()
    return br.sendRaw({ type: 'stopRecording' })
  }, [ensure])

  const addMessageListener = useCallback((fn: (msg: any) => void) => {
    const br = ensure()
    br.onMessage(fn)
  }, [ensure])

  const removeMessageListener = useCallback((fn: (msg: any) => void) => {
    const br = ensure()
    br.offMessage(fn)
  }, [ensure])

  useEffect(() => {
    return () => {
      try { ref.current?.disconnect() } catch {}
      ref.current = null
    }
  }, [])

  return {
    status,
    isAvailable: status === 'available',
    lastPong,
    checkBridge,
    runSequence,
    stop: stopExecution,
    sendRaw,
    registerHotkey,
    unregisterHotkey,
    startRecording,
    stopRecording,
    addMessageListener,
    removeMessageListener,
    bridgeInstance: ref.current,
  }
}
