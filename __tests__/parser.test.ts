import { describe, it, expect } from 'vitest'
import { parseLinesToSteps, parseMacro } from '../lib/parser'

describe('parseLinesToSteps', () => {
  it('parses basic commands', () => {
    const steps = parseLinesToSteps('CHAT /say hello\nKEY TAP e')
    expect(steps).toHaveLength(2)
    expect(steps[0].cmd).toBe('CHAT /say hello')
    expect(steps[0].delay).toBe(100)
    expect(steps[1].cmd).toBe('KEY TAP e')
  })

  it('parses DELAY commands', () => {
    const steps = parseLinesToSteps('DELAY 500')
    expect(steps).toHaveLength(1)
    expect(steps[0].cmd).toBe('DELAY 500')
    expect(steps[0].delay).toBe(500)
  })

  it('ignores blank lines', () => {
    const steps = parseLinesToSteps('CHAT hello\n\n\nKEY TAP e')
    expect(steps).toHaveLength(2)
  })

  it('ignores comment lines starting with #', () => {
    const steps = parseLinesToSteps('# this is a comment\nCHAT hello\n# another comment')
    expect(steps).toHaveLength(1)
    expect(steps[0].cmd).toBe('CHAT hello')
  })

  it('handles DELAY with no value gracefully', () => {
    const steps = parseLinesToSteps('DELAY')
    expect(steps).toHaveLength(1)
    expect(steps[0].delay).toBe(0)
  })

  it('is case-insensitive for DELAY', () => {
    const steps = parseLinesToSteps('delay 300')
    expect(steps).toHaveLength(1)
    expect(steps[0].delay).toBe(300)
  })

  it('returns empty array for empty input', () => {
    expect(parseLinesToSteps('')).toHaveLength(0)
  })

  it('returns empty array for only comments', () => {
    expect(parseLinesToSteps('# just a comment\n# another')).toHaveLength(0)
  })

  it('trims whitespace from lines', () => {
    const steps = parseLinesToSteps('  CHAT hello  \n  KEY TAP e  ')
    expect(steps[0].cmd).toBe('CHAT hello')
    expect(steps[1].cmd).toBe('KEY TAP e')
  })
})

describe('parseMacro', () => {
  it('returns loopCount 1 by default', () => {
    const { steps, loopCount } = parseMacro('CHAT hello')
    expect(loopCount).toBe(1)
    expect(steps).toHaveLength(1)
  })

  it('extracts LOOP count', () => {
    const { steps, loopCount } = parseMacro('LOOP 5\nCHAT hello\nDELAY 100')
    expect(loopCount).toBe(5)
    expect(steps).toHaveLength(2)
    expect(steps[0].cmd).toBe('CHAT hello')
  })

  it('ignores LOOP with zero or negative value', () => {
    const { loopCount } = parseMacro('LOOP 0\nCHAT hello')
    expect(loopCount).toBe(1)
  })

  it('is case-insensitive for LOOP', () => {
    const { loopCount } = parseMacro('loop 3\nCHAT hello')
    expect(loopCount).toBe(3)
  })

  it('uses last LOOP if multiple are specified', () => {
    const { loopCount } = parseMacro('LOOP 2\nCHAT hello\nLOOP 10')
    expect(loopCount).toBe(10)
  })
})
