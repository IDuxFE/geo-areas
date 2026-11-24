# Contributing

## Fork and pull request

Fork `IDuxFE/geo-areas`, create a branch in your fork, and target `main` with a pull request. Ordinary contributors have read access to upstream; maintainers and automation may use upstream branches. All changes to `main` require a pull request, passing CI and resolved review conversations. Force pushes and deletion of `main` are blocked, including for administrators. Maintainers use rebase merges; auto-merge is disabled.

Use English for PR titles, descriptions, release notes and default documentation. Keep the workspace root `README.md` and `README.zh.md` synchronized; package READMEs are generated from the bilingual site guides described below. Localized data values and existing Chinese technical reference reports are retained.

## Local checks

Requires Node.js 20.19+ within the 20.x line, or Node.js 22.12+, and pnpm 10 (the repository pins 10.34.9 for reproducible patch hashes). These development requirements include the site build tools; the published data package supports Node.js 20.19+.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm check
pnpm test:coverage
pnpm site:build
```

CI runs package checks on Node.js 20.19.0, 22 and 24, checks Changesets, builds the site, and packs an archive without publishing. Coverage measures handwritten runtime modules and maintenance scripts, excluding generated data, map loaders and test code. Coverage source maps point back to TypeScript sources.

## Release notes

Complete review and commit the intended changes before preparing a release. At release preparation time, summarize the included changes in English and create the required Changesets together; routine development and documentation work do not require generating a Changeset. CI validates the package graph and changeset syntax but does not demand a changeset for every PR.

For subsequent releases, `pnpm version:packages` consumes pending notes, bumps versions and generates the package changelog. Run it on a release branch and submit a PR. For the first publication, confirm the initial version explicitly; do not run a version bump merely to create the first package. Versioning and publishing are separate actions.

## Data changes

The `Update public-source datasets` workflow runs weekly on Sunday at 17:00 UTC (Monday 01:00 Asia/Shanghai), or manually via Actions. It refreshes upstream dependencies and snapshots, regenerates audit reports, validates the package and site, and creates or updates `chore/update-public-data` only when changes exist. PR creation uses a dedicated GitHub App token so CI and CodeQL start automatically; see [.github/MAINTAINERS.md](.github/MAINTAINERS.md) for the required one-time App setup. Review source hashes, coverage differences, dependency changes and licenses before manually rebase merging. Data updates do not generate Changesets or publish packages; maintainers prepare release notes and version changes separately when a release is ready.

Repository Actions settings must allow GitHub Actions to create pull requests. PRs created with `GITHUB_TOKEN` do not automatically trigger ordinary pull-request workflows. A maintainer can close and reopen the PR using their own account to start checks before merging. Update reports are retained as workflow artifacts for 30 days, including failed runs.

Never edit generated data or license snapshots manually. Change acquisition/transformation code or upstream dependencies, then use `pnpm update:data`. Review `data-manifest.json`, coverage reports and source notices. Full refreshes contact public upstream services and can take time; cached retries must be explicitly requested. Do not commit `.cache`, credentials or local update reports.

The world overview source is [`apache/echarts`, `master`, `test/data/map/json/world.json`](https://github.com/apache/echarts/blob/master/test/data/map/json/world.json). The acquisition script downloads it from [GitHub Raw](https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json). Keep the acquisition URL, manifest provenance and bilingual site source guides synchronized when changing sources. Review the recorded hash because `master` can change. Independent country outlines continue to use Natural Earth.

The code license does not replace third-party data terms. Report defects with a source URL, affected code/map ID, expected behavior and reproduction steps.

## Site examples

Run `pnpm start` to start the Archive documentation site. Add Vue examples under `packages/site/src/examples/<category>/demos/` with an `<archive-meta lang="json">` block containing `title`, `description` and `index`. Each category uses `meta.json` for its navigation name and order; examples are discovered automatically. Shared demo setup lives in `packages/site/setup.ts`. Run `pnpm site:build` to type-check examples and build the site for GitHub Pages.

## API documentation

Maintain the full API reference in `packages/site/src/examples/`. Each category's `API.md` is the Chinese source and `API.en.md` is the English source. Keep both languages synchronized. Shared entry points, conventions and locale configuration live in `packages/site/src/0-guide/reference/API*.md`; manifest types and coverage fields live in `packages/site/src/0-guide/reference/Manifest*.md`. The common API category appears under Guides in the site navigation. Guides focus on integration steps rather than repeating the reference.

The data package build merges these site documents into `packages/geo-areas/API.md` and `API.zh.md`, which ship in the npm archive. Do not edit those generated files directly. After editing site API sources, run `pnpm build` and include the regenerated references in the same change. The root API files remain navigation links. Chapter order is declared in `packages/geo-areas/scripts/generate-api-docs.mjs`.

Use full repository URLs for links to package documents in site API sources (`https://github.com/IDuxFE/geo-areas/blob/main/packages/geo-areas/...`). The generator converts these to package-relative links for offline reading.

## Package guide documentation

Maintain the package introduction, capabilities, installation and usage examples in `packages/site/src/0-guide/GettingStarted.page.md` and `GettingStarted.page.en.md`. Maintain data sources, licensing, coverage and update information in `packages/site/src/0-guide/DataSources.page.md` and `DataSources.page.en.md`. The package build generates `packages/geo-areas/README.zh.md` and `README.md` from these guides, preserving package-local documentation links and language navigation. Source provenance and third-party notices are consolidated in these guides and generated READMEs; retain upstream license texts under `packages/geo-areas/licenses/`. Do not edit the generated package READMEs directly; run `pnpm build` after editing the site guides and include the generated files. The workspace root READMEs remain independently maintained project introductions.
