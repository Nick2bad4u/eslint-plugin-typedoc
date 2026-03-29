---
title: Import-Safe Autofix Decision Tree
description: Decision matrix for when a rewrite can safely insert imports, reuse aliases, or downgrade to suggestion-only mode.
sidebar_position: 7
---

# Import-safe autofix decision tree

This chart explains how import-aware rewrite helpers decide whether to emit a fix, a suggestion, or a diagnostic-only report.

```mermaid
flowchart TD
    classDef check fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef safe fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px
    classDef caution fill:#78350f,stroke:#fcd34d,color:#fffbeb,stroke-width:1px
    classDef stop fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px

    A[Candidate rewrite identified] --> B{Replacement text parse-safe?}
    B -->|No| X[No autofix; emit message only]
    B -->|Yes| C{Required helper symbol already imported?}

    C -->|Yes| D[Reuse in-scope import alias]
    C -->|No| E{Import insertion allowed by settings?}
    E -->|No| Y[Suggestion-only or message only]
    E -->|Yes| F[resolveImportInsertionDecisionForReportFix]

    F --> G{Conflicts or shadowing risk?}
    G -->|Yes| H[getSafeLocalNameForImportedValue]
    H --> I{Safe alias available?}
    I -->|No| Z[Suggestion-only path]
    I -->|Yes| J[Insert import with safe alias]
    G -->|No| J

    D --> K[Rewrite call/member expression]
    J --> K

    K --> L{Semantics preserved?}
    L -->|No| Z
    L -->|Yes| M[Emit autofix via reportWithTypefestPolicy]

    class A,B,C,E,F,G,I,L check
    class D,H,J,K,M safe
    class Y,Z caution
    class X stop
```

## Why this chart matters

- Import insertion is where most autofix regressions happen.
- The tree clarifies that symbol safety and parse safety are independent gates.
- Suggestion fallback is a correctness tool, not a failure mode.

## Review checklist

- Verify import insertion honors plugin settings and nearest program scope.
- Verify local alias selection does not shadow existing bindings.
- Verify rewritten output remains parse-safe and semantically equivalent.
