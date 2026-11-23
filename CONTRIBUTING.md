# Contributing

## Fork and pull request

Fork `IDuxFE/geo-areas`, create a branch in your fork, and target `main` with a pull request. Ordinary contributors have read access to upstream; maintainers and automation may use upstream branches. All changes to `main` require a pull request, passing CI and resolved review conversations. Force pushes and deletion of `main` are blocked, including for administrators. Maintainers use rebase merges; auto-merge is disabled.

Use English for PR titles, descriptions, release notes and default documentation. Keep `README.md` and `README.zh.md` synchronized in both the workspace root and data package. Localized data values and existing Chinese technical reference reports are retained.

## Local checks

Requires Node.js 22+ and pnpm 11.8.0.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm check
pnpm test:coverage
pnpm playground:build
```

CI runs package checks on Node.js 22 and 24, checks Changesets, builds the playground, and packs an archive without publishing. Coverage measures handwritten runtime modules and maintenance scripts, excluding generated data, map loaders and test code. Coverage source maps point back to TypeScript sources.

## Release notes

Run `pnpm changeset` for changes affecting the published package. Select patch, minor or major and write a user-facing note in English. Accumulate notes until a maintainer prepares a release; one release per PR is not required. Documentation, CI and playground-only work can use `pnpm changeset --empty`. CI validates the package graph and changeset syntax but does not demand version bumps for every PR.

`pnpm version:packages` consumes pending notes, bumps versions and generates the package changelog. Run it on a release branch and submit a PR. Do not run it for routine contributions. Publishing is disabled during development.

## Data changes

Never edit generated data or license snapshots manually. Change acquisition/transformation code or upstream dependencies, then use `pnpm update:data`. Review `data-manifest.json`, coverage reports and source notices. Full refreshes contact public upstream services and can take time; cached retries must be explicitly requested. Do not commit `.cache`, credentials or local update reports.

The code license does not replace third-party data terms. Report defects with a source URL, affected code/map ID, expected behavior and reproduction steps.
