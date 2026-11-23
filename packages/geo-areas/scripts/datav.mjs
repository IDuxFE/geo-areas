/** Validate responses before caching or accepting a successful fallback. */
function validateMap(map, code, outlineOnly) {
  if (map?.type !== 'FeatureCollection' || !Array.isArray(map.features) || !map.features.length)
    throw new Error(`Invalid DataV map: ${code}`)
  for (const feature of map.features) {
    if (
      !['Polygon', 'MultiPolygon'].includes(feature.geometry?.type) ||
      !feature.geometry.coordinates?.length
    )
      throw new Error(`Invalid DataV geometry: ${code}`)
  }
  if (
    outlineOnly &&
    (map.features.length !== 1 || String(map.features[0].properties?.adcode) !== code)
  )
    throw new Error(`Unexpected DataV outline: ${code}`)
}

function httpStatus(error) {
  return error.status ?? (error.cause ? httpStatus(error.cause) : null)
}

/** A failed child-boundary endpoint may still have a valid standalone outline. */
export async function loadDataVMap(code, fetchJSON, onFallback = () => {}) {
  const base = `https://geo.datav.aliyun.com/areas_v3/bound/${code}`
  const fullUrl = `${base}_full.json`
  const outlineUrl = `${base}.json`
  try {
    return {
      map: await fetchJSON(fullUrl, (map) => validateMap(map, code, false)),
      outlineOnly: false,
    }
  } catch (fullError) {
    const recovery = {
      code,
      from: fullUrl,
      to: outlineUrl,
      reason: fullError.message,
      fullHttpStatus: httpStatus(fullError),
      fullEndpointStatus: httpStatus(fullError) === 404 ? 'not-found' : 'error',
      status: 'pending',
    }
    onFallback(recovery)
    try {
      const map = await fetchJSON(outlineUrl, (map) => validateMap(map, code, true))
      recovery.status = 'success'
      return { map, outlineOnly: true }
    } catch (outlineError) {
      recovery.status = 'failed'
      recovery.error = outlineError.message
      throw new AggregateError(
        [fullError, outlineError],
        `DataV ${code}: ${fullError.message}; ${outlineError.message}`,
      )
    }
  }
}
