import { freezeData } from './immutable.js'
import { subdivisionData } from './generated/subdivisions.js'
import type { Subdivision } from './types.js'
export const subdivisions = freezeData(subdivisionData)
export function getSubdivisions(countryCode: string): Subdivision[] {
  return structuredClone(
    subdivisionData.filter((item) => item.countryCode === countryCode.toUpperCase()),
  )
}
