import assert from 'node:assert/strict'
import { appendFile, readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

/** Deploy the exact uploaded artifact, avoiding an eventually consistent name lookup. */
export async function deployPages({
  repository,
  runId,
  artifactId,
  sha,
  request,
  sleep,
  attempts = 60,
}) {
  assert.equal(repository, 'IDuxFE/geo-areas', 'Only upstream may deploy')
  assert.match(String(artifactId), /^\d+$/, 'Invalid artifact id')
  const base = `/repos/${repository}`
  // Metadata may take a short time to appear after upload finalization.
  let artifact
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      artifact = await request(`${base}/actions/artifacts/${artifactId}`)
    } catch (error) {
      if (error.status !== 404) throw error
    }
    if (artifact) break
    await sleep(2000)
  }
  assert.ok(artifact, `Artifact ${artifactId} is not visible`)
  assert.equal(artifact.name, 'github-pages', 'Unexpected artifact name')
  assert.equal(artifact.expired, false, 'Artifact expired')
  assert.equal(String(artifact.workflow_run.id), String(runId), 'Artifact belongs to another run')
  assert.ok(artifact.size_in_bytes > 0, 'Empty Pages artifact')
  const deployment = await request(`${base}/pages/deployments`, {
    method: 'POST',
    body: {
      artifact_id: Number(artifactId),
      pages_build_version: sha,
      oidc_token: await request('oidc'),
    },
  })
  assert.ok(deployment.id, 'Missing Pages deployment id')
  const statusPath = `${base}/pages/deployments/${deployment.id}`
  try {
    for (let attempt = 0; attempt < attempts; attempt++) {
      let result
      try {
        result = await request(statusPath)
      } catch (error) {
        if (
          !(
            error.status === 429 ||
            error.status >= 500 ||
            error.name === 'TimeoutError' ||
            error instanceof TypeError
          )
        )
          throw error
        await sleep(5000)
        continue
      }
      if (result.status === 'succeed') {
        const url = new URL(deployment.page_url)
        assert.equal(url.origin, 'https://iduxfe.github.io')
        return url.href
      }
      if (
        [
          'deployment_failed',
          'deployment_content_failed',
          'deployment_cancelled',
          'deployment_lost',
          'failed',
          'cancelled',
        ].includes(result.status)
      )
        throw new Error(`Pages deployment ${deployment.id}: ${result.status}`)
      await sleep(5000)
    }
    throw new Error(`Pages deployment ${deployment.id} timed out`)
  } catch (error) {
    try {
      await request(`${statusPath}/cancel`, { method: 'POST' })
    } catch (cancelError) {
      throw new AggregateError([error, cancelError], `${error.message}; cancellation failed`)
    }
    throw error
  }
}

async function main() {
  const env = process.env
  const event = JSON.parse(await readFile(env.GITHUB_EVENT_PATH, 'utf8'))
  assert.equal(event.workflow_run?.conclusion, 'success')
  assert.equal(event.workflow_run?.event, 'push')
  assert.equal(event.workflow_run?.head_branch, 'main')
  assert.equal(event.workflow_run?.head_repository?.full_name, env.GITHUB_REPOSITORY)
  const request = async (path, options = {}) => {
    const oidc = path === 'oidc'
    const response = await fetch(
      oidc ? env.ACTIONS_ID_TOKEN_REQUEST_URL : `https://api.github.com${path}`,
      {
        method: options.method,
        headers: {
          Authorization: `Bearer ${oidc ? env.ACTIONS_ID_TOKEN_REQUEST_TOKEN : env.GH_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(20000),
      },
    )
    if (!response.ok)
      throw Object.assign(new Error(`Pages API ${path}: HTTP ${response.status}`), {
        status: response.status,
      })
    if (response.status === 204) return
    const result = await response.json()
    if (oidc) {
      assert.ok(result.value, 'Missing OIDC token')
      return result.value
    }
    return result
  }
  const url = await deployPages({
    repository: env.GITHUB_REPOSITORY,
    runId: env.GITHUB_RUN_ID,
    artifactId: env.PAGES_ARTIFACT_ID,
    sha: event.workflow_run.head_sha,
    request,
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  })
  await appendFile(env.GITHUB_OUTPUT, `page_url=${url}\n`)
  await appendFile(
    env.GITHUB_STEP_SUMMARY,
    `Deployed ${event.workflow_run.head_sha} to [GitHub Pages](${url}).\n`,
  )
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
