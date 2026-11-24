import { createRequire } from 'node:module'

// Resolve the release planner shipped with the installed CLI so dependency versions agree.
const require = createRequire(import.meta.resolve('@changesets/cli/package.json'))
const { default: getReleasePlan } = require('@changesets/get-release-plan')
const plan = await getReleasePlan(process.cwd())
console.log(
  `Validated ${plan.changesets.length} Changesets and ${plan.releases.filter((release) => release.type !== 'none').length} planned releases.`,
)
