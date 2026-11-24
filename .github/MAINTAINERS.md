# Maintainer setup

## Repository policy

- Upstream: `IDuxFE/geo-areas`; personal forks use `origin`, upstream uses `upstream` locally.
- `main` is protected by an active ruleset with no bypass actors: pull requests, successful `CI required` and `CodeQL analysis`, an up-to-date branch, resolved review conversations and linear history are required; deletion and force pushes are blocked.
- Only rebase merge is enabled. Auto-merge is disabled. Maintainers merge manually. No independent approval count is required during initial development so a maintainer can merge their own passing PR; review discussions still must be resolved.
- Ordinary organization members have read access and contribute through forks. Organization owners retain administrative access; a repository ruleset cannot remove their ability to administer organization settings.
- Actions uses read-only default permissions. Workflows request write permissions only for specific jobs. Fork PR checks use `pull_request`, never execute PR code through `pull_request_target`, and have no publishing credentials.

## CI, coverage and security

CI checks Node.js 20.19.0, 22 and 24, formatting, lint, package build/tests/types, Changesets, site build and the packed archive. `CI required` aggregates the matrix and coverage jobs. Coverage includes handwritten runtime TypeScript and maintenance scripts, including unexecuted files, but excludes generated snapshots/loaders. TypeScript source maps connect runtime coverage back to source.

Codecov uses GitHub OIDC for upstream runs and public fork PR uploads. The organization GitHub App must have access to the repository. Review `codecov.yml`: project coverage may drop at most one percentage point from its baseline, and changed lines target 90%. Codecov checks are initially advisory to branch protection until a main-branch baseline exists; coverage generation and upload failures still fail CI.

FOSSA's organization GitHub App scans this repository automatically. License Compliance, Security Analysis and Dependency Quality statuses have been verified on merged dependency and documentation PRs. `.fossa.yml` excludes local build/cache directories and disables CLI telemetry. No API key is embedded and no duplicate CLI project is created. If the App does not produce a check, enable/import `IDuxFE/geo-areas` in the organization's FOSSA dashboard. Do not add a required FOSSA status until its exact check name and a successful scan have been verified. FOSSA dependency results do not resolve map-data redistribution terms; continue reviewing the sources and licensing section in `packages/geo-areas/README.md`.

CodeQL analyzes handwritten JavaScript/TypeScript on PRs, main and weekly. Dependabot checks Actions and npm dependencies weekly. Dependabot alerts, automated security fixes, secret scanning, push protection and private vulnerability reporting are enabled in GitHub settings where supported.

## Pages

GitHub Pages uses Actions and the `github-pages` environment, restricted to `main`. After a successful CI push run on upstream `main`, `pages.yml` downloads that run's prebuilt `github-pages` artifact and deploys it without checking out or executing contributor code. PR artifacts are built for validation but never deployed by this workflow.

The site is served at <https://iduxfe.github.io/geo-areas/>. Its first deployment requires merging the setup PR and a successful main-branch CI run. Before merging, only the build and artifact can be verified. Use Actions to inspect the deployment; a PR cannot validate the final public URL before the deployment workflow exists on main.

## Changesets and publishing

Complete code review and commit the intended changes before preparing release notes. When a release is ready, create the Changesets together. For subsequent releases, run `pnpm version:packages` in a release branch, review the package version and CHANGELOG, and open a release PR. The first publication uses an explicitly agreed initial version and does not require a Changesets version bump. The built-in Changesets changelog generator works locally without a GitHub token.

There is no automatic version-PR or npm publishing step in normal CI. The existing `publish.yml` is disabled in repository settings, and its job also requires `vars.NPM_PUBLISH_ENABLED == 'true'`. Forks cannot publish through it. No tag or npm release is created by this setup.

Only when publication is explicitly approved:

1. Resolve documented third-party redistribution questions and confirm the intended package version.
2. Prepare and merge a release PR. For the first publication, keep the explicitly agreed initial version; for subsequent releases, generate the version and CHANGELOG with Changesets.
3. Confirm the npm account's `@idux` scope access. The package must exist before configuring a Trusted Publisher: arrange the first publication manually from the verified release archive. Then configure npm Trusted Publisher for owner `IDuxFE`, repository `geo-areas`, workflow `publish.yml`, environment `npm` for subsequent versions.
4. Create the `npm` GitHub environment with appropriate deployment approval and a tag policy allowing `v*`.
5. Enable the Publish workflow and set repository variable `NPM_PUBLISH_ENABLED=true`.
6. For subsequent releases, push the matching `v<version>` tag only after release approval. Publishing verifies the tag/version match, requires the commit to be an ancestor of upstream main with successful push CI and CodeQL runs at that exact commit, checks the package and uses OIDC provenance. Do not trigger automated publishing for the version already published manually.

The data-update workflow runs upstream only and opens a PR with changed data and audit reports. It does not generate Changesets or change package versions. GitHub does not recursively run ordinary PR workflows for PRs created using `GITHUB_TOKEN`; a maintainer can close/reopen the PR to start checks, or later configure a dedicated GitHub App credential. Never bypass CI to merge an update PR.
