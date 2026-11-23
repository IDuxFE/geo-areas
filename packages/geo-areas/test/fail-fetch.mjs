globalThis.fetch = async () => {
  if (process.env.GEO_AREAS_TEST_FETCH_MODE === 'http')
    return new Response('Missing source', { status: 404 })
  if (process.env.GEO_AREAS_TEST_FETCH_MODE === 'json')
    return new Response('Invalid JSON', { status: 200 })
  throw new Error('Simulated upstream network failure')
}
