---
sidebar_position: 3
---

# TypeDoc pipeline

`eslint-plugin-typedoc` uses TypeDoc for API reference generation and ESLint for
inline documentation validation.

## Source-of-truth layers

- **Rules + metadata** in `src/rules/` and `src/_internal/`.
- **Rule docs** in `docs/rules/`.
- **Site docs** in `docs/docusaurus/site-docs/`.
- **Generated API docs** in `docs/docusaurus/site-docs/developer/api/`.

## Generation flow

1. `npm run docs:api` runs TypeDoc against source and writes markdown output.
2. `npm run sync:readme-rules-table:write` updates the README rule matrix.
3. `npm run sync:presets-rules-matrix -- --write` updates preset docs tables.
4. `npm run docs:docusaurus:build` validates final site output.

## Why this split matters

- Rule behavior remains test-driven in source/tests.
- Human-authored docs stay readable.
- Generated API docs remain reproducible and machine-verifiable.
