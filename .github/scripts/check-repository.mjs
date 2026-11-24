import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

/** Read-only audit of the documented upstream policy. Never repairs settings. */
export function validateRepositoryPolicy({
  repository,
  ruleset,
  actions,
  workflowPermissions,
  environment,
  branchPolicies,
}) {
  assert.equal(repository.default_branch, 'main')
  assert.equal(repository.allow_merge_commit, false, 'Merge commits must be disabled')
  assert.equal(repository.allow_squash_merge, false, 'Squash merge must be disabled')
  assert.equal(repository.allow_rebase_merge, true, 'Rebase merge must be enabled')
  assert.equal(repository.allow_auto_merge, false, 'Auto-merge must be disabled')
  assert.equal(repository.delete_branch_on_merge, true)
  assert.equal(ruleset.enforcement, 'active', 'Main ruleset must be active')
  assert.deepEqual(ruleset.conditions.ref_name, { include: ['refs/heads/main'], exclude: [] })
  assert.deepEqual(
    ruleset.bypass_actors,
    [{ actor_id: null, actor_type: 'OrganizationAdmin', bypass_mode: 'pull_request' }],
    'Only the documented administrator PR exception is allowed',
  )
  const rule = (type) => {
    const found = ruleset.rules.find((entry) => entry.type === type)
    assert.ok(found, `Missing rule: ${type}`)
    return found.parameters
  }
  for (const type of ['deletion', 'non_fast_forward', 'required_linear_history']) rule(type)
  const pr = rule('pull_request')
  assert.equal(pr.required_approving_review_count, 1)
  assert.equal(pr.dismiss_stale_reviews_on_push, true)
  assert.equal(pr.required_review_thread_resolution, true)
  assert.deepEqual(pr.allowed_merge_methods, ['rebase'])
  const checks = rule('required_status_checks')
  assert.equal(checks.strict_required_status_checks_policy, true)
  for (const context of ['CI required', 'CodeQL analysis'])
    assert.ok(
      checks.required_status_checks.some(
        (check) => check.context === context && check.integration_id === 15368,
      ),
      `Missing GitHub Actions check: ${context}`,
    )
  assert.equal(actions.enabled, true)
  assert.equal(workflowPermissions.default_workflow_permissions, 'read')
  assert.equal(environment.deployment_branch_policy.custom_branch_policies, true)
  assert.equal(environment.deployment_branch_policy.protected_branches, false)
  assert.deepEqual(
    branchPolicies.map(({ name, type }) => ({ name, type })),
    [{ name: 'main', type: 'branch' }],
  )
}

export function readRepositoryPolicy(api) {
  const base = 'repos/IDuxFE/geo-areas'
  const rulesets = api(`${base}/rulesets`)
  const protection = rulesets.find(({ name }) => name === 'Protect main')
  assert.ok(protection, 'Missing Protect main ruleset')
  return {
    repository: api(base),
    ruleset: api(`${base}/rulesets/${protection.id}`),
    actions: api(`${base}/actions/permissions`),
    workflowPermissions: api(`${base}/actions/permissions/workflow`),
    environment: api(`${base}/environments/github-pages`),
    branchPolicies: api(`${base}/environments/github-pages/deployment-branch-policies`)
      .branch_policies,
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    validateRepositoryPolicy(
      readRepositoryPolicy((path) =>
        JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8', timeout: 30000 })),
      ),
    )
    console.log(
      'Upstream repository policy matches .github/MAINTAINERS.md. No settings were changed.',
    )
  } catch (error) {
    console.error(`Repository policy audit failed: ${error.message}`)
    process.exitCode = 1
  }
}
