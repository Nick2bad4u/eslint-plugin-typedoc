---
title: Quality Gates and Release Flow
description: CI quality gates and the release-hardening path for eslint-plugin-typefest.
sidebar_position: 4
---

# Quality gates and release flow

This diagram shows the expected quality path from implementation through release readiness, including failure loops.

```mermaid
flowchart LR
    classDef stage fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef quality fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px
    classDef release fill:#312e81,stroke:#a5b4fc,color:#eef2ff,stroke-width:1px
    classDef failure fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px

    Design[Design] --> Implement[Implement]
    Implement --> LocalChecks[Local checks\nTypecheck • Test • Lint • Docs]
    LocalChecks --> PRReady[PR ready]
    LocalChecks --> Rework[Fix local failures]
    Rework --> Implement

    PRReady --> CI[CI pipeline\nInstall • Build • Test • Lint • Docs • Package checks]
    CI --> ReleaseCandidate[Release candidate]
    CI --> Triage[Failure triage]
    Triage --> Implement

    ReleaseCandidate --> ReleaseCheck[Release check script]
    ReleaseCheck --> PublishReady[Publish ready]
    ReleaseCheck --> RegressionFix[Fix release regressions]
    RegressionFix --> Implement

    class Design,Implement,PRReady stage
    class LocalChecks,CI,ReleaseCheck quality
    class ReleaseCandidate,PublishReady release
    class Rework,Triage,RegressionFix failure
```

## Gate intent

- **Typecheck/Test/Lint** protect runtime correctness and rule quality.
- **Docs build** ensures documentation and API pages remain valid.
- **Package checks** prevent broken public artifacts.
- **Release check** is the final integrated confidence pass.

## Command mapping

- Local quality gates: `npm run typecheck`, `npm run test`, `npm run lint:all:fix:quiet`
- Documentation confidence: `npm run docs:build` (or `npm run --workspace docs/docusaurus build:fast` for quick docs-only edits)
- Release hardening: `npm run release:check`
