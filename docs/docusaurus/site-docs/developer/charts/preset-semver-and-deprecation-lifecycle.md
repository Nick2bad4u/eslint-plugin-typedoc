---
title: Preset Semver and Deprecation Lifecycle
description: Lifecycle for adding, reclassifying, deprecating, or removing rules in presets with semver-aware release handling.
sidebar_position: 12
---

# Preset semver and deprecation lifecycle

This chart defines the expected semver-aware flow when preset membership changes are proposed.

```mermaid
flowchart TD
    classDef plan fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef minor fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px
    classDef major fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px
    classDef docs fill:#78350f,stroke:#fcd34d,color:#fffbeb,stroke-width:1px

    A[Preset change proposed] --> B{Change type}
    B -->|Add disabled-by-default docs only| C[Docs-only note]
    B -->|Add rule to opt-in preset| D[Minor release candidate]
    B -->|Enable stricter default behavior in existing preset| E[Major release candidate]
    B -->|Remove or rename preset key| E

    C --> F[Update preset docs + matrix]
    D --> G[Update plugin configs + metadata]
    E --> G

    G --> H[Add migration guidance]
    H --> I[Validate tests + docs + release checks]

    I --> J{Semver classification confirmed?}
    J -->|No| K[Escalate to ADR/review discussion]
    J -->|Yes| L[Publish with changelog + upgrade notes]

    K --> B

    class A,B,G,H,I,J plan
    class C,D,F minor
    class E,K major
    class L docs
```

## Maintainer guidance

- Preset key removals and stricter defaults are major-change candidates.
- Preset additions can be minor when existing behavior stays intact.
- Every preset-impacting change should include explicit migration notes.
