import { subdivisionData } from './generated/subdivisions.js'
import type { Subdivision } from './types.js'
export const subdivisions: readonly Subdivision[] = subdivisionData
export function getSubdivisions(countryCode: string): Subdivision[] {
  return subdivisions.filter((item) => item.countryCode === countryCode.toUpperCase())
}
