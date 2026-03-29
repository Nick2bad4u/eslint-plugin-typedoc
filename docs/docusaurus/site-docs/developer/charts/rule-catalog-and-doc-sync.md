---
title: Rule Catalog and Docs Synchronization
description: How rule source files, catalog IDs, metadata, docs pages, and metadata tests stay aligned.
sidebar_position: 4
---

# Rule catalog and docs synchronization

Use this diagram to understand how a single rule change propagates through catalog identity, docs metadata, and validation tests.

```mermaid
flowchart TB
    classDef src fill:#1e293b,stroke:#93c5fd,color:#f8fafc,stroke-width:1px
    classDef catalog fill:#312e81,stroke:#a5b4fc,color:#eef2ff,stroke-width:1px
    classDef docs fill:#14532d,stroke:#86efac,color:#f0fdf4,stroke-width:1px
    classDef tests fill:#7f1d1d,stroke:#fca5a5,color:#fef2f2,stroke-width:1px
    classDef output fill:#0f766e,stroke:#5eead4,color:#ecfeff,stroke-width:1px

    RuleSource[src/rules/prefer-*.ts]
    TypedRule[src/_internal/typed-rule.ts]
    RuleCatalog[src/_internal/rule-catalog.ts]
    RuleDocsMetadata[src/_internal/rule-docs-metadata.ts]
    RuleDocs[docs/rules/*.md]
    RuleSidebar[docs/docusaurus/sidebars.rules.ts]
    IntegrityTests[test/rule-metadata-integrity.test.ts]
    SnapshotTests[test/rule-metadata-snapshots.test.ts]
    SmokeTests[test/_internal/rule-metadata-smoke.ts]
    BuiltDocs[Docusaurus Rule Pages]

    RuleSource --> TypedRule
    RuleSource --> RuleCatalog
    RuleCatalog --> RuleDocsMetadata
    TypedRule --> RuleDocsMetadata
    RuleDocs --> RuleDocsMetadata
    RuleDocsMetadata --> RuleSidebar
    RuleSidebar --> BuiltDocs

    RuleDocsMetadata --> IntegrityTests
    RuleDocsMetadata --> SnapshotTests
    RuleDocsMetadata --> SmokeTests

    RuleDocs --> BuiltDocs

    class RuleSource,TypedRule src
    class RuleCatalog,RuleDocsMetadata catalog
    class RuleDocs,RuleSidebar docs
    class IntegrityTests,SnapshotTests,SmokeTests tests
    class BuiltDocs output
```

## Why this matters

- Stable catalog IDs prevent accidental reorder/regression bugs in rule references.
- Metadata tests catch drift between source metadata and docs content early.
- Sidebars and generated docs stay deterministic when source-of-truth metadata is consistent.

## Common maintenance workflow

1. Update rule logic and `meta.docs` fields in the rule source.
2. Confirm catalog identity and metadata extraction remain aligned.
3. Update rule docs if examples/options changed.
4. Run metadata-integrity + snapshot tests before merging.
