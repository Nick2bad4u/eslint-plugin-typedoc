---
title: Typed Rule Performance Budget and Hotspots
description: Performance budget model for typed rules, highlighting hot paths, cache points, and escalation thresholds.
sidebar_position: 10
---

# Typed rule performance budget and hotspots

Use this chart to reason about where semantic rules spend time and where to place guardrails before regressions land in CI.

```mermaid
flowchart TD
    classDef budget fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef fast fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px
    classDef medium fill:#78350f,stroke:#fcd34d,color:#fffbeb,stroke-width:1px
    classDef hot fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px

    A[Rule visitor entry] --> B[Syntax prefilter]
    B --> C{Candidate likely reportable?}
    C -->|No| D[Exit cheap path]
    C -->|Yes| E[Acquire typed services]

    E --> F[getConstrainedTypeAtLocationWithFallback]
    F --> G{Type operation cached?}
    G -->|Yes| H[Reuse cached semantic result]
    G -->|No| I[Compute semantic predicate]

    I --> J{Rewrite/fix path needed?}
    J -->|No| K[Report message only]
    J -->|Yes| L[Import-safe fix analysis]

    L --> M{Fix safe?}
    M -->|No| N[Suggestion or no-fix report]
    M -->|Yes| O[Emit autofix]

    I --> P[Record operation timings in benchmark fixtures]
    P --> Q{Budget threshold exceeded?}
    Q -->|No| R[Keep current strategy]
    Q -->|Yes| S[Add stronger syntax guards/caching]
    S --> B

    class A,B,C,E,F,G budget
    class D,H,K,O,R fast
    class I,J,L,M,N,P medium
    class Q,S hot
```

## Budget policy cues

- Treat semantic type resolution as an expensive tier after syntax prefilters.
- Prefer memoized expression predicates for repeated patterns.
- Escalate benchmark regressions before adding new typed checks in hot visitors.

## Maintainer checklist

1. Add syntax short-circuits before any checker call.
2. Cache repeated type analyses where AST identity is stable.
3. Verify benchmark fixtures when rule logic expands semantic coverage.
