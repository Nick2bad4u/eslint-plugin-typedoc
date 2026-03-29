---
sidebar_position: 4
---

# API reference

The generated API reference is produced from TypeScript source using TypeDoc.

## Build and browse

```bash
npm run docs:api
```

Then open the **Generated TypeDoc API** category in the Developer sidebar.

## Generation config

- TypeDoc config file:
  [`docs/docusaurus/typedoc.config.json`](../typedoc.config.json)
- Source roots:
  - `src/plugin.ts`
  - `src/_internal/`
  - `src/rules/`

## Maintenance rules

- Do not manually edit generated API markdown pages.
- Update source JSDoc/TSDoc comments and regenerate.
- Keep generated docs route stable for sidebar links and deep-link sharing.
