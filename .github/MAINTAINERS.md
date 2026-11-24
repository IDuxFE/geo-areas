# Maintainer setup

## Repository policy

- Upstream: `IDuxFE/geo-areas`; personal forks use `origin`, upstream uses `upstream` locally.
- `main` is protected by an active ruleset with an administrator exception restricted to pull requests: pull requests, successful `CI required` and `CodeQL analysis`, an up-to-date branch, resolved review conversations and linear history are required; deletion and force pushes are blocked.
- Only rebase merge is enabled. Auto-merge is disabled. Maintainers merge manually. The ordinary path requires one approval and dismisses stale approvals after pushes. Organization administrators have a PR-only bypass for exceptional cases; it does not permit direct pushes. Review discussions must be resolved.
- Ordinary organization members have read access and contribute through forks. Organization owners retain administrative access; a repository ruleset cannot remove their ability to administer organization settings.
- Actions uses read-only default permissions. Workflows request write permissions only for specific jobs. Fork PR checks use `pull_request`, never execute PR code through `pull_request_target`, and have no publishing credentials.

## CI, coverage and security

CI checks Node.js 20.19.0, 22 and 24, formatting, lint, package build/tests/types, Changesets, site build and the packed archive. `CI required` aggregates the matrix and coverage jobs. Coverage includes handwritten runtime TypeScript and maintenance scripts, including unexecuted files, but excludes generated snapshots/loaders. TypeScript source maps connect runtime coverage back to source.

Codecov uses GitHub OIDC for upstream runs and public fork PR uploads. The organization GitHub App must have access to the repository. Review `codecov.yml`: project coverage may drop at most one percentage point from its baseline, and changed lines target 90%. Codecov checks are initially advisory to branch protection until a main-branch baseline exists; local coverage must meet 95% lines/statements, 90% functions and 85% branches. These thresholds fail CI independently of Codecov availability; upload failures also fail CI.

FOSSA's organization GitHub App scans this repository automatically. License Compliance, Security Analysis and Dependency Quality statuses have been verified on merged dependency and documentation PRs. `.fossa.yml` excludes local build/cache directories and disables CLI telemetry. No API key is embedded and no duplicate CLI project is created. If the App does not produce a check, enable/import `IDuxFE/geo-areas` in the organization's FOSSA dashboard. Do not add a required FOSSA status until its exact check name and a successful scan have been verified. FOSSA dependency results do not resolve map-data redistribution terms; continue reviewing the sources and licensing section in `packages/geo-areas/README.md`.

Run `pnpm check:repository` with an authenticated maintainer `gh` session to audit these repository, branch, Actions and Pages policies without changing them. Administrative read access is needed for settings endpoints; this command is intentionally separate from fork PR CI.

CodeQL analyzes handwritten JavaScript/TypeScript on PRs, main and weekly. Dependabot checks Actions and npm dependencies weekly. Dependabot alerts, automated security fixes, secret scanning, push protection and private vulnerability reporting are enabled in GitHub settings where supported.

## Pages

GitHub Pages uses Actions and the `github-pages` environment, restricted to `main`. After a successful CI push run on upstream `main`, `pages.yml` downloads that run's prebuilt `github-pages` artifact and reuploads it in the deployment run. The deployment script is checked out from trusted main, uses the exact upload artifact ID, waits for REST metadata visibility, verifies run ownership, and requests an OIDC-authenticated Pages deployment. It polls to a terminal result and cancels on timeout or polling failure; it does not check out the triggering commit or execute PR code. PR artifacts are built for validation but never deployed by this workflow.

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

## Automated data-update PRs

The data-update workflow runs upstream only and opens a PR with changed data and audit reports. It does not generate Changesets or change package versions. It uses a dedicated GitHub App installation token to push the update branch and create/update the PR, allowing ordinary PR CI and CodeQL workflows to run automatically. Maintainers still review and rebase merge manually; never bypass required checks or add the App to ruleset bypass actors.

### One-time GitHub App setup

1. Check organization Settings → GitHub Apps for Apps you manage, and Settings → Installed GitHub Apps for installations. Third-party Apps such as Codecov and FOSSA are not credentials for this workflow. Reuse an App only if you can manage its private keys and its permissions fit this task.
2. If needed, register an organization-owned App at <https://github.com/organizations/IDuxFE/settings/apps/new>. Choose a unique name (for example, `iduxfe-geo-areas-data-updater`) and use the repository URL as its homepage. Disable the webhook (no webhook endpoint is needed). Allow installation only on this account.
3. Grant repository permissions **Contents: Read and write** and **Pull requests: Read and write**. Metadata read access is automatic. No organization permissions, events or Actions write permission are needed.
4. Install the App on `IDuxFE`, choosing **Only select repositories → geo-areas**. If reusing an App after permission changes, approve the updated installation permissions.
5. Copy the App's **Client ID** from its settings. In repository Settings → Secrets and variables → Actions → Variables, create `DATA_UPDATE_APP_CLIENT_ID` with that value.
6. In the App settings, select **Generate a private key**. Store the entire downloaded PEM file, including its BEGIN/END lines, as repository Actions secret `DATA_UPDATE_APP_PRIVATE_KEY`. Do not commit the PEM or paste it into PRs or chat. No client secret is required.
7. After merging the workflow change, manually run **Update public-source datasets** on `main`. If it creates or updates a PR, verify that CI and CodeQL start without clicking **Approve workflows to run**, then review and rebase merge yourself. An unchanged snapshot may produce no PR update and therefore no new checks.

The workflow fails early with configuration guidance if either credential is missing. The default `GITHUB_TOKEN` has read-only contents permission and checkout does not persist credentials. The App token is created only after validation, scoped to this repository with contents/PR write permissions, and revoked by the token action during job cleanup. There is no fallback to `GITHUB_TOKEN`, which would restore the manual workflow-approval requirement.

## Data update recovery

The updater holds `packages/geo-areas/.update-lock` for the update and stages all output before installation. A caught installation failure restores previous generated files, maps, manifest, coverage documentation and licenses. If rollback itself fails, `.update-backup-*` and the lock are retained and the report identifies the recovery directory. Reports include nested error causes and filesystem codes.

Multi-path installation is not atomic against process termination or power loss. After an interrupted update, verify no updater is running, inspect the backup directory and restore its entries to the corresponding package paths (`generated` → `src/generated`, `data` → `src/data`, other entries → package root). An absent backup entry may already have been restored or may not have been moved yet; do not delete current files blindly. Check the manifest fingerprint with `pnpm check` before removing the lock/backups and retrying. Do not remove locks belonging to another active update.

`pnpm docs:sync` regenerates packaged English and Chinese documentation from the site sources; package compilation itself consumes only package-local files. CI regenerates docs and checks their committed copies. Review [dependency patch maintenance](../patches/README.md) when changing overrides or patched dependencies.
