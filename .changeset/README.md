# Changesets

Run `pnpm changeset` for changes to the published data package. Choose a semantic version bump and write the release note in English. Documentation, CI and playground-only changes may use an empty changeset (`pnpm changeset --empty`). Multiple changes can accumulate before a release.

When ready, a maintainer runs `pnpm version:packages` on a branch and opens a release PR. This consumes the notes and updates the package version and CHANGELOG.md. Versioning does not publish. npm publishing is currently disabled; see [maintainer setup](../.github/MAINTAINERS.md).
