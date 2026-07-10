import type { MacroStep } from './types'

export function parseLinesToSteps(codeText: string): MacroStep[] {
  const lines = codeText.split('\n')
  const steps: MacroStep[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue

    const parts = line.split(/\s+/)
    if (parts[0].toUpperCase() === 'DELAY') {
      const ms = parseInt(parts[1] || '0', 10) || 0
      steps.push({ cmd: `DELAY ${ms}`, delay: ms })
    } else {
      steps.push({ cmd: line, delay: 100 })
    }
  }

  return steps
}

export const DEFAULT_MACRO = `# My first macro
/say Hello from McMacroMaker!
DELAY 200
KEY TAP e
DELAY 100
MOUSE_MOVE 960 540
MOUSE_CLICK left`
