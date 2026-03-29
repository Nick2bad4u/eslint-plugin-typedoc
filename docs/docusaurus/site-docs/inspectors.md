---
sidebar_position: 5
---

# Inspector workflows

This repository publishes static inspector artifacts for ESLint and Stylelint to
help debug effective configuration and rule behavior.

## Build inspector artifacts

```bash
npm run build:eslint-inspector
npm run build:stylelint-inspector
```

## Output paths

- ESLint inspector: `docs/docusaurus/static/eslint-inspector/`
- Stylelint inspector: `docs/docusaurus/static/stylelint-inspector/`

## Recommended usage

- Use inspector outputs after major config changes.
- Verify plugin rule enablement and preset layering.
- Include inspector updates in PRs that alter lint surface area.
