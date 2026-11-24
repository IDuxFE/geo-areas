import assert from 'node:assert/strict'
import { test } from 'node:test'
import { verifyRelease } from './verify-release.mjs'

const repository = 'IDuxFE/geo-areas'
const successfulRun = (workflow, id) => ({
  id,
  path: `.github/workflows/${workflow}`,
  head_sha: 'release-sha',
  head_branch: 'main',
  head_repository: { full_name: repository },
  event: 'push',
  status: 'completed',
  conclusion: 'success',
})
const release = () => ({
  repository,
  refType: 'tag',
  tag: 'v0.1.0',
  version: '0.1.0',
  sha: 'release-sha',
  runs: [successfulRun('ci.yml', 1), successfulRun('codeql.yml', 2)],
})

test('release accepts matching tags only with successful upstream push validation', () => {
  assert.doesNotThrow(() => verifyRelease(release()))
  for (const override of [
    { repository: 'someone/geo-areas' },
    { refType: 'branch' },
    { tag: 'v0.2.0' },
    { runs: [] },
    { runs: [successfulRun('ci.yml', 1)] },
  ]) {
    assert.throws(() => verifyRelease({ ...release(), ...override }))
  }
})

test('PR, other-commit, other-branch and fork runs cannot authorize a release', () => {
  for (const override of [
    { event: 'pull_request' },
    { head_sha: 'another-sha' },
    { head_branch: 'feature' },
    { head_repository: { full_name: 'someone/geo-areas' } },
    { path: '.github/workflows/unrelated.yml' },
    { status: 'in_progress' },
    { conclusion: 'failure' },
  ]) {
    const data = release()
    Object.assign(data.runs[0], override)
    assert.throws(() => verifyRelease(data))
  }
})

test('a previous success cannot hide newer failed or pending validation', () => {
  for (const override of [{ conclusion: 'failure' }, { status: 'queued', conclusion: null }]) {
    const data = release()
    data.runs.unshift({ ...successfulRun('ci.yml', 3), ...override })
    assert.throws(() => verifyRelease(data))
  }
})
