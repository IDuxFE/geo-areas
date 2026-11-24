# Changesets

Prepare Changesets when the intended code has been reviewed and committed and a maintainer is preparing a release. Summarize the included changes in English and choose the appropriate semantic version bump. Routine development, documentation and CI changes do not require generating Changesets as they are made.

For subsequent releases, run `pnpm version:packages` on a release branch to consume the notes and update the package version and CHANGELOG.md, then open a release PR. For the first publication, explicitly confirm the initial version; running a version bump is not required to publish the first package. Versioning does not publish. See [maintainer setup](../.github/MAINTAINERS.md) for publishing prerequisites.
