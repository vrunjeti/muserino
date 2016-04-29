/**
 * Performs a set union on setA and setB
 */
export function setUnion(setA, setB) {
  if (Array.isArray(setA)) setA = new Set(setA)
  if (Array.isArray(setB)) setB = new Set(setB)
  return new Set([...setA, ...setB])
}

/**
 * Performs a set intersection on setA and setB
 */
export function setIntersection(setA, setB) {
  if (Array.isArray(setA)) setA = new Set(setA)
  if (Array.isArray(setB)) setB = new Set(setB)
  return new Set([...setA].filter(el => setB.has(el)))
}

/**
 * Performs a set difference on setA and setB
 */
export function setDifference(setA, setB) {
  if (Array.isArray(setA)) setA = new Set(setA)
  if (Array.isArray(setB)) setB = new Set(setB)
  return new Set([...setA].filter(el => !setB.has(el)))
}