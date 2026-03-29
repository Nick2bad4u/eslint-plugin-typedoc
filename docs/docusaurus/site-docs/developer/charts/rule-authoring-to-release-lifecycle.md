---
title: Rule Authoring to Release Lifecycle
description: End-to-end lifecycle from rule proposal through implementation, validation, docs, and publish readiness.
sidebar_position: 13
---

# Rule authoring to release lifecycle

This chart gives contributors a single map for the full rule delivery process, including docs and release gates.

```mermaid
flowchart LR
    classDef stage fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef quality fill:#0f766e,stroke:#5eead4,color:#ecfeff,stroke-width:1px
    classDef docs fill:#78350f,stroke:#fcd34d,color:#fffbeb,stroke-width:1px
    classDef release fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px

    A[Problem identified] --> B[Rule proposal and scope]
    B --> C[AST selector strategy + safety plan]
    C --> D[Implement rule + shared helpers]
    D --> E[Add RuleTester coverage]
    E --> F[Typecheck + lint + tests]
    F --> G[Write/update rule docs]
    G --> H[Update ADR/charts if architecture changed]
    H --> I[Run docs build + release checks]
    I --> J[Prepare changelog + release notes]
    J --> K[Publish-ready]

    class A,B,C,D stage
    class E,F quality
    class G,H docs
    class I,J,K release
```

## Practical use

- Keep the selector strategy explicit before coding to avoid broad traversals.
- Do not treat docs as post-release cleanup; they are part of the delivery path.
- If a rule shifts project policy, update ADRs in the same change window.
