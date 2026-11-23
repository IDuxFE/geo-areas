/** Check map availability independently of the download queue, including terminal cities. */
export function validateChinaMapCoverage(maps, includeCities = true) {
  const missing = []
  for (const [parent, map] of maps) {
    if (!/^\d{6}$/.test(parent)) continue
    for (const { properties: p } of map.features) {
      if (p.level !== 'province' && !(includeCities && p.level === 'city')) continue
      const code = String(p.code ?? p.adcode)
      if (!maps.has(code)) missing.push(`${parent}/${code} ${p.name}`)
    }
  }
  if (missing.length) throw new Error(`Missing China maps: ${missing.join(', ')}`)
}
