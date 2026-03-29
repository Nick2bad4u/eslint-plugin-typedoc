---
title: Change Impact and Validation Matrix
description: Decision flow for selecting the right validation depth based on what changed.
sidebar_position: 5
---

# Change impact and validation matrix

This flowchart helps maintainers choose the minimum safe validation set for each class of change.

```mermaid
flowchart TD
    classDef decision fill:#1f2937,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef low fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px
    classDef medium fill:#78350f,stroke:#fcd34d,color:#fffbeb,stroke-width:1px
    classDef high fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px
    classDef command fill:#0f766e,stroke:#5eead4,color:#ecfeff,stroke-width:1px

    Start{What changed?}
    DocsOnly[Docs/CSS/sidebar content only]
    RuleDocsMetadata[Rule docs metadata or catalog changed]
    RuleImplementation[Rule logic/fixer/AST logic changed]
    BuildConfig[Build/lint/test/release scripts changed]

    DocsChecks[npm run --workspace docs/docusaurus build:fast]
    MetadataChecks[npm run test -- rule-metadata*\n+ npm run typecheck]
    RuleChecks[npm run test\n+ npm run typecheck\n+ targeted RuleTester suites]
    FullChecks[npm run lint:all:fix:quiet\n+ npm run docs:build\n+ npm run release:check]

    Start --> DocsOnly
    Start --> RuleDocsMetadata
    Start --> RuleImplementation
    Start --> BuildConfig

    DocsOnly --> DocsChecks
    RuleDocsMetadata --> MetadataChecks
    RuleImplementation --> RuleChecks
    BuildConfig --> FullChecks

    DocsChecks --> DoneLow([Low-risk validation complete])
    MetadataChecks --> DoneMedium([Medium-risk validation complete])
    RuleChecks --> DoneHigh([High-risk validation complete])
    FullChecks --> DoneCritical([Critical-path validation complete])

    class Start decision
    class DocsOnly,DoneLow low
    class RuleDocsMetadata,DoneMedium medium
    class RuleImplementation,DoneHigh high
    class BuildConfig,DoneCritical high
    class DocsChecks,MetadataChecks,RuleChecks,FullChecks command
```

## Suggested usage

- Use this matrix during PR review to agree on validation scope upfront.
- Escalate to the next validation tier if a change touches multiple categories.
- Prefer over-testing rather than under-testing for release-adjacent changes.
