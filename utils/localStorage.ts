// small helper for localStorage macros (not exhaustive)

export function loadMacros(userId: string) {
  const key = `macros:${userId}`
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export function saveMacros(userId: string, macros: any[]) {
  const key = `macros:${userId}`
  localStorage.setItem(key, JSON.stringify(macros))
}
