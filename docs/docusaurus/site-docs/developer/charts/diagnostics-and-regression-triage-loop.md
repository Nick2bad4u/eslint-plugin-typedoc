---
title: Diagnostics and Regression Triage Loop
description: End-to-end workflow for moving from failing diagnostics to root-cause fixes and confidence revalidation.
sidebar_position: 11
---

# Diagnostics and regression triage loop

This chart captures the expected maintainer response when lint/type/test/docs gates report regressions.

```mermaid
flowchart LR
    classDef detect fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef analyze fill:#0f766e,stroke:#5eead4,color:#ecfeff,stroke-width:1px
    classDef fix fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px
    classDef risk fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px

    A[Signal detected\nCI fail, local fail, docs warning] --> B[Classify failure type]
    B --> C[Lint diagnostics]
    B --> D[Typecheck diagnostics]
    B --> E[Test failures]
    B --> F[Docs/anchor failures]

    C --> G[Map to file + rule + policy]
    D --> G
    E --> G
    F --> G

    G --> H{Root cause identified?}
    H -->|No| I[Add targeted reproduction\nfixture or focused command]
    I --> G
    H -->|Yes| J[Implement minimal robust fix]

    J --> K[Run focused validation]
    K --> L{Focused checks green?}
    L -->|No| M[Refine hypothesis + fix]
    M --> G
    L -->|Yes| N[Run broader gate set\ntypecheck + lint + test + docs build]

    N --> O{Regression cleared?}
    O -->|No| P[Escalate to design/ADR review]
    O -->|Yes| Q[Document rationale in docs/ADR/test comments]

    class A,B,C,D,E,F detect
    class G,H,I analyze
    class J,K,L,N,O,Q fix
    class M,P risk
```

## Why this matters

- Prevents symptom-fixing loops by requiring explicit root-cause confirmation.
- Keeps maintainers from skipping from one failing gate to broad speculative edits.
- Encourages reproducible regression tests before high-risk refactors.

## Command strategy

- Start focused: single file diagnostics or targeted tests.
- Expand only after local root cause is stable.
- Finish with full quality gates for merge confidence.
