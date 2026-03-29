---
title: Preset Composition and Rule Matrix
description: How base/recommended/type-checked presets are assembled and how rule metadata flows into preset-level documentation.
sidebar_position: 8
---

# Preset composition and rule matrix

This diagram explains how rule metadata and preset definitions combine into user-facing preset guidance and rule enablement matrices.

```mermaid
flowchart LR
    classDef source fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef meta fill:#312e81,stroke:#a5b4fc,color:#eef2ff,stroke-width:1px
    classDef preset fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px
    classDef docs fill:#7c2d12,stroke:#fdba74,color:#fff7ed,stroke-width:1px

    A[src/rules/*.ts\nmeta.docs + requiresTypeChecking]
    B[src/_internal/rule-catalog.ts]
    C[src/_internal/rule-docs-metadata.ts]
    D[src/plugin.ts\ntypefestConfigs]

    E[typefest.configs.base]
    F[typefest.configs.recommended]
    G[typefest.configs.recommendedTypeChecked]

    H[docs/rules/presets/*.md]
    I[Rule matrix sections]
    J[Docusaurus preset pages]

    A --> B --> C
    A --> D
    C --> D

    D --> E
    D --> F
    D --> G

    E --> H
    F --> H
    G --> H
    C --> I
    I --> H --> J

    class A,B,D source
    class C meta
    class E,F,G preset
    class H,I,J docs
```

## Practical use

- Use this chart when adding or reclassifying a rule across presets.
- Verify `requiresTypeChecking` and recommendation flags align with target preset.
- Keep preset docs and rule matrix sections synchronized with metadata outputs.

## Common failure modes

1. Rule added to config object but omitted from docs matrix.
2. Rule listed in matrix but missing from actual preset object.
3. Type-aware rule accidentally included in non-type-checked preset without guardrails.
