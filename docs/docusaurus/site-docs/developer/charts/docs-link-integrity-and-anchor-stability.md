---
title: Docs Link Integrity and Anchor Stability
description: Validation loop for preventing broken links and unstable anchor references across docs and generated API pages.
sidebar_position: 9
---

# Docs link integrity and anchor stability

This chart captures how documentation links should be authored, validated, and repaired to keep navigation trustworthy across manual and generated pages.

```mermaid
flowchart TD
    classDef author fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef validate fill:#0f766e,stroke:#5eead4,color:#ecfeff,stroke-width:1px
    classDef fail fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px
    classDef done fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px

    A[Author docs links and anchors] --> B[Run docs:api if API surface changed]
    B --> C[Run docs build and markdown checks]
    C --> D{Broken links/anchors reported?}

    D -->|No| E[Merge-ready docs navigation]
    D -->|Yes| F[Classify failure]

    F --> G[Missing heading or renamed section]
    F --> H[Sidebar/doc ID drift]
    F --> I[Generated API anchor drift]

    G --> J[Add stable heading/anchor target]
    H --> K[Fix route/id reference in docs or sidebar]
    I --> L[Update source comment/signature or link target]

    J --> M[Rebuild docs]
    K --> M
    L --> N[Regenerate TypeDoc]
    N --> M
    M --> C

    class A,B author
    class C,D,F validate
    class G,H,I fail
    class E,J,K,L,M,N done
```

## Maintainer policy cues

- Prefer durable section headings for frequently referenced anchors.
- Avoid linking to generated anchors when a stable page-level section can be used instead.
- Treat repeated anchor breakage as a documentation architecture issue, not a one-off typo.

## Suggested command sequence

```bash
npm run docs:api
npm run docs:build
```

For docs-only edits where speed matters:

```bash
npm run --workspace docs/docusaurus build:fast
```
