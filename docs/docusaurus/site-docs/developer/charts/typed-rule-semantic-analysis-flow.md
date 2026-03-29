---
title: Typed Rule Semantic Analysis Flow
description: Detailed flow for parser-services acquisition, guarded type operations, and fail-fast behavior in typed rules.
sidebar_position: 6
---

# Typed rule semantic analysis flow

This chart focuses on the semantic path used by typed rules, including service acquisition, constrained-type lookup fallback, and guarded reporting behavior.

```mermaid
flowchart TD
    classDef entry fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef guard fill:#0f766e,stroke:#5eead4,color:#ecfeff,stroke-width:1px
    classDef fail fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px
    classDef path fill:#312e81,stroke:#a5b4fc,color:#eef2ff,stroke-width:1px

    A[Rule visitor enters node] --> B{Typed rule required?}
    B -->|No| C[Run syntax-only checks]
    B -->|Yes| D[getTypedRuleServices]

    D --> E{parserServices.program available?}
    E -->|No| F[Throw explicit typed-context error]
    E -->|Yes| G[Resolve checker + parserServices]

    G --> H[getConstrainedTypeAtLocationWithFallback]
    H --> I{Constrained lookup succeeded?}
    I -->|Yes| J[Use constrained semantic type]
    I -->|No| K[Fallback to esTreeNodeToTSNodeMap + checker.getTypeAtLocation]

    K --> L{Fallback type resolved?}
    L -->|No| M[Skip semantic branch safely]
    L -->|Yes| N[Use fallback semantic type]

    J --> O[Run rule-specific semantic predicates]
    N --> O
    C --> P[Report syntax-only findings]
    O --> Q{Fix or suggest safe?}
    Q -->|Fix safe| R[reportWithTypefestPolicy fix]
    Q -->|Only suggest safe| S[reportWithTypefestPolicy suggest]
    Q -->|Unsafe rewrite| T[report message only]

    F --> U[Fail fast and surface configuration issue]
    M --> V[Continue traversal without crash]

    class A,B,D,E,H,I,L,Q entry
    class C,G,J,K,N,O,P,R,S,T path
    class M,V guard
    class F,U fail
```

## Maintainer interpretation

- Treat semantic calls as a guarded path, not a default path.
- `getConstrainedTypeAtLocationWithFallback` is the main reliability bridge between ideal type information and resilient fallback behavior.
- Fail-fast behavior is intentional for typed-rule contexts and should not be replaced with silent degradation.

## Operational checkpoints

1. If users report typed-rule crashes, verify parser service availability first.
2. If semantic branches become expensive, add syntax-level short-circuits before type operations.
3. Keep report/fix policy centralized to prevent per-rule drift in rewrite safety.
