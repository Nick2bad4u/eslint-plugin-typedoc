---
sidebar_position: 2
---

# Local developer workflow

## Install dependencies

```bash
npm install
```

## Core local validation loop

```bash
npm run build
npm run typecheck
npm test
npm run lint:all:fix:quiet
```

## Docs workflow

```bash
npm run docs:api
npm run sync:readme-rules-table:write
npm run sync:presets-rules-matrix -- --write
npm run docs:docusaurus:build
```

## Inspector outputs

- ESLint inspector build output: `docs/docusaurus/static/eslint-inspector/`
- Stylelint inspector build output:
  `docs/docusaurus/static/stylelint-inspector/`
