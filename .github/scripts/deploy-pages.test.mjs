import assert from 'node:assert/strict'
import { test } from 'node:test'
import { deployPages } from './deploy-pages.mjs'

function fixture({ invisible = 0, status = 'succeed', runId = 10, expired = false } = {}) {
  const calls = []
  let reads = 0
  return {
    calls,
    options: {
      repository: 'IDuxFE/geo-areas',
      runId: 10,
      artifactId: '20',
      sha: 'abc',
      attempts: 2,
      sleep: async () => {},
      request: async (path, options = {}) => {
        calls.push({ path, ...options })
        if (path.endsWith('/actions/artifacts/20')) {
          if (++reads <= invisible) throw Object.assign(new Error('Not visible'), { status: 404 })
          return { name: 'github-pages', workflow_run: { id: runId }, expired, size_in_bytes: 100 }
        }
        if (path === 'oidc') return 'private-token'
        if (path.endsWith('/cancel')) return
        if (options.method === 'POST')
          return { id: 30, page_url: 'https://iduxfe.github.io/geo-areas/' }
        return { status }
      },
    },
  }
}
test('Pages uses the upload id and waits for metadata visibility before deploying', async () => {
  const { calls, options } = fixture({ invisible: 2 })
  assert.equal(await deployPages(options), 'https://iduxfe.github.io/geo-areas/')
  const post = calls.find(({ method }) => method === 'POST')
  assert.deepEqual(post.body, {
    artifact_id: 20,
    pages_build_version: 'abc',
    oidc_token: 'private-token',
  })
  assert.equal(calls.filter(({ path }) => path.endsWith('/actions/artifacts/20')).length, 3)
})
for (const config of [{ runId: 99 }, { expired: true }, { invisible: 10 }])
  test(`Pages rejects invalid artifacts before deployment: ${JSON.stringify(config)}`, async () => {
    const { calls, options } = fixture(config)
    await assert.rejects(deployPages(options))
    assert.ok(calls.every(({ method }) => method !== 'POST'))
  })
for (const status of [
  'deployment_failed',
  'deployment_content_failed',
  'deployment_cancelled',
  'queued',
])
  test(`Pages reports ${status} and cancels unfinished deployments`, async () => {
    const { calls, options } = fixture({ status })
    await assert.rejects(deployPages(options), /Pages deployment 30/)
    assert.ok(calls.some(({ path }) => path.endsWith('/cancel')))
  })
test('Pages refuses forks', async () => {
  const { options } = fixture()
  await assert.rejects(
    deployPages({ ...options, repository: 'someone/geo-areas' }),
    /Only upstream/,
  )
})

test('Pages tolerates transient status API errors without creating duplicate deployments', async () => {
  const { calls, options } = fixture()
  const request = options.request
  let failed = false
  options.request = async (path, args) => {
    if (path.endsWith('/pages/deployments/30') && !failed) {
      failed = true
      throw Object.assign(new Error('Temporary API outage'), { status: 503 })
    }
    return request(path, args)
  }
  await deployPages(options)
  assert.equal(calls.filter(({ method }) => method === 'POST').length, 1)
})
