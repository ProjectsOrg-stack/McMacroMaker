import type { MacroStep, ParsedMacro } from './types'

export function parseLinesToSteps(codeText: string): MacroStep[] {
  return parseMacro(codeText).steps
}

export function parseMacro(codeText: string): ParsedMacro {
  const lines = codeText.split('\n')
  const steps: MacroStep[] = []
  let loopCount = 1

  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue

    const parts = line.split(/\s+/)
    const cmd = parts[0].toUpperCase()

    if (cmd === 'LOOP') {
      const n = parseInt(parts[1] || '1', 10)
      if (n > 0) loopCount = n
      continue
    }

    if (cmd === 'DELAY') {
      const ms = parseInt(parts[1] || '0', 10) || 0
      steps.push({ cmd: `DELAY ${ms}`, delay: ms })
    } else {
      steps.push({ cmd: line, delay: 100 })
    }
  }

  return { steps, loopCount }
}

export const DEFAULT_MACRO = `# My first macro
/say Hello from McMacroMaker!
DELAY 200
KEY TAP e
DELAY 100
MOUSE_MOVE 960 540
MOUSE_CLICK left`
