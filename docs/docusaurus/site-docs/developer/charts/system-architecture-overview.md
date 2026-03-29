---
title: System Architecture Overview
description: High-level architecture of eslint-plugin-typefest runtime, rules, docs, and integration layers.
sidebar_position: 1
---

# System architecture overview

This diagram shows how source modules, rule metadata, docs, generated tooling assets, and consumer projects fit together.

```mermaid
flowchart TB
    classDef source fill:#312e81,stroke:#a5b4fc,color:#eef2ff,stroke-width:1px
    classDef runtime fill:#0f766e,stroke:#5eead4,color:#ecfeff,stroke-width:1px
    classDef docs fill:#7c2d12,stroke:#fdba74,color:#fff7ed,stroke-width:1px
    classDef ext fill:#334155,stroke:#94a3b8,color:#f8fafc,stroke-width:1px

    subgraph S[Source Layer]
      R[src/rules/*.ts]
      I[src/_internal/*.ts]
      P[src/plugin.ts]
      C[src/_internal/rule-catalog.ts]
      M[src/_internal/rule-docs-metadata.ts]
    end

    subgraph RT[Runtime Layer]
      ER[ESLint Rule Modules]
      PC[Flat Config Presets]
      MD[Normalized Rule Metadata]
    end

    subgraph D[Documentation Layer]
      RD[docs/rules/*.md]
      DD[docs/docusaurus/site-docs/developer/*]
      SB[docs/docusaurus/sidebars*.ts]
      CSS[docs/docusaurus/src/css/custom.css]
    end

    subgraph E[External Integrations]
      CONS[Consumer Projects]
      CI[CI + GitHub Actions]
      SITE[Docusaurus Site]
      IDE[IDE + ESLint Language Server]
      INSP[ESLint Config Inspector]
    end

    R --> ER
    I --> ER
    C --> M
    M --> MD
    P --> PC
    ER --> PC
    MD --> P

    RD --> SB
    DD --> SB
    SB --> SITE
    CSS --> SITE
    MD --> RD

    PC --> CONS
    ER --> IDE
    SITE --> CONS
    PC --> INSP
    CI --> SITE
    CI --> INSP
    CI --> CONS

    class R,I,P,C,M source
    class ER,PC,MD runtime
    class RD,DD,SB,CSS docs
    class CONS,CI,SITE,IDE,INSP ext
```

## Notes

- The rule catalog provides stable IDs for traceability (`R001`, `R002`, ...).
- `createTypedRule` centralizes rule metadata and type-aware wiring.
- Rule docs and Docusaurus sidebars remain aligned through shared metadata conventions.

## How to read this diagram

- **Source layer** is where maintainers edit behavior and contracts.
- **Runtime layer** is what ESLint and consumers execute directly.
- **Documentation layer** controls generated/static docs discoverability.
- **External integrations** represent CI, IDE, and published artifact entry points.
