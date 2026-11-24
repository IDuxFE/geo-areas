import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateRepositoryPolicy, readRepositoryPolicy } from './check-repository.mjs'

function fixture() {
  return {
    repository: {
      default_branch: 'main',
      allow_merge_commit: false,
      allow_squash_merge: false,
      allow_rebase_merge: true,
      allow_auto_merge: false,
      delete_branch_on_merge: true,
    },
    ruleset: {
      enforcement: 'active',
      conditions: { ref_name: { include: ['refs/heads/main'], exclude: [] } },
      bypass_actors: [
        { actor_id: null, actor_type: 'OrganizationAdmin', bypass_mode: 'pull_request' },
      ],
      rules: [
        ...['deletion', 'non_fast_forward', 'required_linear_history'].map((type) => ({ type })),
        {
          type: 'pull_request',
          parameters: {
            required_approving_review_count: 1,
            dismiss_stale_reviews_on_push: true,
            required_review_thread_resolution: true,
            allowed_merge_methods: ['rebase'],
          },
        },
        {
          type: 'required_status_checks',
          parameters: {
            strict_required_status_checks_policy: true,
            required_status_checks: ['CI required', 'CodeQL analysis'].map((context) => ({
              context,
              integration_id: 15368,
            })),
          },
        },
      ],
    },
    actions: { enabled: true },
    workflowPermissions: { default_workflow_permissions: 'read' },
    environment: {
      deployment_branch_policy: { custom_branch_policies: true, protected_branches: false },
    },
    branchPolicies: [{ name: 'main', type: 'branch' }],
  }
}
test('documented policy is accepted', () => validateRepositoryPolicy(fixture()))
for (const [name, mutate] of [
  [
    'direct administrator bypass',
    (s) => {
      s.ruleset.bypass_actors[0].bypass_mode = 'always'
    },
  ],
  [
    'auto-merge',
    (s) => {
      s.repository.allow_auto_merge = true
    },
  ],
  [
    'missing required checks',
    (s) => {
      s.ruleset.rules.pop()
    },
  ],
  [
    'write default token',
    (s) => {
      s.workflowPermissions.default_workflow_permissions = 'write'
    },
  ],
  [
    'tag deployment access',
    (s) => {
      s.branchPolicies.push({ name: '*', type: 'tag' })
    },
  ],
])
  test(`policy audit catches ${name}`, () => {
    const state = fixture()
    mutate(state)
    assert.throws(() => validateRepositoryPolicy(state))
  })
test('policy reader only requests upstream resources and fails if protection is missing', () => {
  const paths = []
  const state = fixture()
  const responses = [
    [{ name: 'Protect main', id: 7 }],
    state.repository,
    state.ruleset,
    state.actions,
    state.workflowPermissions,
    state.environment,
    { branch_policies: state.branchPolicies },
  ]
  assert.deepEqual(
    readRepositoryPolicy((path) => {
      paths.push(path)
      return responses.shift()
    }),
    state,
  )
  assert.ok(paths.every((path) => path.startsWith('repos/IDuxFE/geo-areas')))
  assert.throws(() => readRepositoryPolicy(() => []), /Missing Protect main/)
})
