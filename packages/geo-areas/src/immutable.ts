import type { DeepReadonly } from './types.js'

/** Freeze JSON-like reference data once; query APIs return editable independent copies. */
export function freezeData<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezeData(child)
    Object.freeze(value)
  }
  return value as DeepReadonly<T>
}
