import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

/** Require the newest push-to-main run of each validation workflow to pass. */
export function verifyRelease({ repository, refType, tag, version, sha, runs }) {
  assert.equal(repository, 'IDuxFE/geo-areas', 'Releases must originate from upstream')
  assert.equal(refType, 'tag', 'Releases require a version tag')
  assert.equal(tag, `v${version}`, 'Tag/version mismatch')
  for (const workflow of ['ci.yml', 'codeql.yml']) {
    const matching = runs
      .filter(
        (run) =>
          run.path === `.github/workflows/${workflow}` &&
          run.head_sha === sha &&
          run.event === 'push' &&
          run.head_branch === 'main' &&
          run.head_repository?.full_name === repository,
      )
      .sort((a, b) => b.id - a.id)
    assert.ok(matching.length, `Missing upstream main validation: ${workflow}`)
    assert.equal(matching[0].status, 'completed', `${workflow} has not completed`)
    assert.equal(matching[0].conclusion, 'success', `${workflow} did not succeed`)
  }
}

async function main() {
  const {
    GITHUB_REPOSITORY: repository,
    GITHUB_REF_TYPE: refType,
    GITHUB_REF_NAME: tag,
  } = process.env
  const { version } = JSON.parse(await readFile('packages/geo-areas/package.json', 'utf8'))
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  // Full checkout fetches origin/main too. A tag outside main must never publish.
  execFileSync('git', ['merge-base', '--is-ancestor', sha, 'origin/main'])
  assert.ok(process.env.GH_TOKEN, 'GitHub read token is required to verify validation')
  assert.equal(repository, 'IDuxFE/geo-areas', 'Releases must originate from upstream')
  const runs = []
  for (let page = 1; ; page++) {
    const url = new URL(`https://api.github.com/repos/${repository}/actions/runs`)
    url.search = new URLSearchParams({ head_sha: sha, per_page: '100', page: String(page) })
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GH_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(20_000),
    })
    assert.ok(response.ok, `Cannot verify upstream validation: HTTP ${response.status}`)
    const data = await response.json()
    assert.ok(Array.isArray(data.workflow_runs), 'Invalid workflow-run response')
    runs.push(...data.workflow_runs)
    if (data.workflow_runs.length < 100) break
  }
  verifyRelease({ repository, refType, tag, version, sha, runs })
  console.log(`Verified ${tag} at ${sha}: merged into main, CI and CodeQL passed.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
