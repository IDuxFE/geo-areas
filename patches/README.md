# Dependency compatibility patches

`pnpm-workspace.yaml` pins patched dependencies and records their patch files. Install with the pinned pnpm version and `--frozen-lockfile` so these patches cannot silently disappear.

| Patch                                      | Reason                                                                         | Validation                              | Removal condition                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------ |
| `@idux/archive-vite-markdown-plugin@0.5.0` | Adapt LRU and emoji imports to the overridden dependency exports.              | `pnpm site:build`                       | Archive supports the maintained dependency versions directly.                  |
| `shiki-processor@0.1.3`                    | Adapt highlighter creation, theme names and line annotations to current Shiki. | Site tooling test and `pnpm site:build` | Upstream processor supports the current Shiki API with equivalent annotations. |
| `@manypkg/get-packages@3.1.0`              | Preserve the root-package property expected by Changesets 2.                   | Changeset validation test               | Changesets adopts the current Manypkg return contract.                         |
| `c8@12.0.0`                                | Use the current `findUpSync` export after overriding find-up.                  | `pnpm test:coverage`                    | c8 supports the current find-up API directly.                                  |
| `istanbul-lib-report@3.0.1`                | Read the ESM default export from the overridden supports-color.                | `pnpm test:coverage`                    | Istanbul supports that dependency version directly.                            |

Review overrides together with their patches when updating tooling. Remove an override and its patch only after the corresponding checks pass without it; a successful dependency vulnerability scan alone does not demonstrate API compatibility. Keep overrides scoped to the consuming dependency when possible.
