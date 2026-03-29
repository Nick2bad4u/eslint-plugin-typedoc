---
title: Typed Services Guard and Fallback Paths
description: Visual map of typed-rule guard entry points, fallback branches, and safe-degradation outcomes.
sidebar_position: 15
---

# Typed services guard and fallback paths

This diagram summarizes how typed paths are entered, guarded, and degraded safely when full services are unavailable.

```mermaid
flowchart TB
    classDef entry fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef typed fill:#312e81,stroke:#a5b4fc,color:#eef2ff,stroke-width:1px
    classDef safe fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px
    classDef fail fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px

    A[Rule entry] --> B{requiresTypeChecking?}
    B -->|Yes| C[createTypedRule guard]
    B -->|No| D[syntax-first branch]

    C --> E{has parserServices.program?}
    E -->|No| F[fail-fast typed-context error]
    E -->|Yes| G[getTypedRuleServices]

    D --> H{needs optional semantic branch?}
    H -->|No| I[report syntax findings only]
    H -->|Yes| J[hasTypeServices(context)]

    J -->|No| K[skip semantic branch safely]
    J -->|Yes| L[getTypedRuleServices]

    G --> M[getConstrainedTypeAtLocationWithFallback]
    L --> M

    M --> N{constrained lookup succeeded?}
    N -->|Yes| O[typed predicate checks]
    N -->|No| P[fallback checker/node-map lookup]

    P --> Q{fallback type resolved?}
    Q -->|No| R[continue traversal safely]
    Q -->|Yes| O

    O --> S[report fix/suggestion/message via policy adapter]

    class A,B,C,D,H,J entry
    class G,L,M,N,P,Q,O typed
    class I,K,R,S safe
    class F fail
```

## Notes

- Typed rules intentionally fail fast when required services are missing.
- Optional typed branches in non-type-checked rules must degrade safely.
- This model should remain aligned with `developer/typed-paths` inventory updates.

## Related docs

- [Typed service path inventory](../typed-paths.md)
- [Typed rule semantic analysis flow](./typed-rule-semantic-analysis-flow.md)
- [Type-aware linting readiness guide](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/guides/type-aware-linting-readiness)
