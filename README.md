# Geo Areas

[English](README.md) | [简体中文](README.zh.md)

[![CI](https://github.com/IDuxFE/geo-areas/actions/workflows/ci.yml/badge.svg)](https://github.com/IDuxFE/geo-areas/actions/workflows/ci.yml)
[![CodeQL](https://github.com/IDuxFE/geo-areas/actions/workflows/codeql.yml/badge.svg)](https://github.com/IDuxFE/geo-areas/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/IDuxFE/geo-areas/branch/main/graph/badge.svg)](https://codecov.io/gh/IDuxFE/geo-areas)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FIDuxFE%2Fgeo-areas.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FIDuxFE%2Fgeo-areas?ref=badge_shield)

Geographic data for TypeScript: countries and regions, calling codes, administrative divisions, and ECharts-ready GeoJSON, with automated data updates and an interactive map playground.

- [@idux/geo-areas](packages/geo-areas/README.md): the ESM data package with TypeScript declarations and lazily loaded maps.
- [API reference](API.md): public interfaces, parameters, return values and data fields.
- [Playground](https://iduxfe.github.io/geo-areas/): an interactive Vue 3 / iDux demo with map drill-down ([source](packages/playground/)). The site deploys after a successful CI run on `main`.

## Development

Requires Node.js 22+ and pnpm 11.8.0. This package is under development and has not been published to npm. Use the workspace to try it locally.

```sh
pnpm install --frozen-lockfile
pnpm playground
pnpm playground:build
pnpm check
pnpm test:coverage
```

Run `pnpm update:data` to refresh data from public upstream sources. Playground output is written to `packages/playground/dist`.

`pnpm lint` runs Oxlint; `pnpm format` formats files with Oxfmt; `pnpm format:check` checks formatting. Husky and lint-staged check staged files before commits. Generated data, source manifests and third-party license snapshots retain their original formatting.

## Packaging and release notes

The workspace root and playground are private packages. Only `packages/geo-areas` is publishable.

```sh
pnpm changeset              # record a package change for a future release
pnpm check
pnpm --dir packages/geo-areas pack
```

The archive includes runtime data, documentation, licenses and source notices. `prepack` runs the build, tests and consumer type checks. CI also builds the playground and uploads a package preview without publishing it.

Changesets accumulate until a maintainer runs `pnpm version:packages` on a release branch. This updates `packages/geo-areas/package.json` and its [changelog](packages/geo-areas/CHANGELOG.md); it does not publish. npm publishing is disabled. See [maintainer setup](.github/MAINTAINERS.md) before enabling a release.

## Data and licenses

Project code is MIT licensed. Third-party data has separate terms; see [source notices](packages/geo-areas/THIRD_PARTY_NOTICES.md), including the outstanding redistribution checks. Automated dependency scans do not establish permission to redistribute map datasets.

The world overview uses Apache ECharts example data. China province maps can use DataV `100000` or ECharts 3.8.5 `china` (alias `CN-provinces`). Coverage and drill-down codes are documented in the [package README](packages/geo-areas/README.md).

## Contributing

Fork this repository, create a branch and open a pull request against `IDuxFE/geo-areas:main`. Direct changes to `main` are blocked; changes require passing CI and resolved review discussions. Maintainers merge using rebase.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for checks and Changesets, and [SECURITY.md](SECURITY.md) for vulnerability reporting.
