---
title: Docs and API Pipeline
description: How rule docs, TypeDoc output, sidebars, and the final docs site are produced.
sidebar_position: 3
---

# Docs and API pipeline

This flow highlights the relationship between authored docs, generated API docs, sidebar wiring, and final Docusaurus output.

```mermaid
flowchart LR
    classDef authored fill:#1e293b,stroke:#94a3b8,color:#f8fafc,stroke-width:1px
    classDef generated fill:#064e3b,stroke:#34d399,color:#ecfdf5,stroke-width:1px
    classDef validation fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px
    classDef output fill:#312e81,stroke:#a5b4fc,color:#eef2ff,stroke-width:1px

    A[docs/rules/*.md]
    B[docs/docusaurus/site-docs/**]
    C[src/plugin.ts + src/rules/**]
    D[scripts/remark-lint-rule-doc-headings.mjs]
    E[npm run docs:api]
    F[TypeDoc output under site-docs/developer/api]
    G[sidebars.ts + sidebars.rules.ts]
    H[npm run docs:build]
    I[Static Docusaurus site]

    A --> D
    B --> D
    C --> E --> F
    A --> G
    B --> G
    F --> G
    D --> H
    G --> H
    E --> H
    H --> I

    class A,B,C authored
    class F generated
    class D,E,H validation
    class G,I output
```

## Operational guidance

- Treat TypeDoc output as generated artifacts; edit source code, not generated files.
- Keep sidebars aligned with file paths and generated API entrypoints.
- Use full docs build in CI for confidence that rule docs and API docs stay synchronized.

## Troubleshooting signals

- If API pages drift, inspect `npm run docs:api` output first.
- If pages disappear from nav, validate `sidebars.ts` / `sidebars.rules.ts` IDs.
- If Markdown linting fails, run docs checks before full build to shorten feedback loops.
