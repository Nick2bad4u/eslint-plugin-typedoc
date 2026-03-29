---
title: Rule Lifecycle and Autofix Flow
description: End-to-end flow for AST matching, typed checks, diagnostics, and safe autofix/suggestions.
sidebar_position: 2
---

# Rule lifecycle and autofix flow

This sequence diagram models what happens from lint invocation through optional fix output and safety fallback behavior.

```mermaid
sequenceDiagram
    autonumber
    box Lavender Lint engine
    participant ESLint as ESLint Engine
    end
    box LightYellow Rule and typed wrapper
    participant Rule as Rule Module
    participant Typed as createTypedRule
    end
    box LightCyan Type system bridge
    participant Parser as parserServices
    participant TS as TypeChecker
    end
    box LightGreen Reporting and rewriting
    participant Report as reportWithTypefestPolicy
    participant Fix as Fix/Suggestion Builder
    end

    ESLint->>Rule: load rule + meta
    Rule->>Typed: create(context)
    Typed->>Parser: getParserServices(context, true)
    Parser-->>Typed: parserServices + program
    Typed->>TS: program.getTypeChecker()

    loop For matched AST nodes
        Rule->>Rule: cheap syntax guards
        Rule->>TS: optional semantic checks
        TS-->>Rule: type information
        Rule->>Fix: compute safe rewrite options
        alt autofix is safe
            Fix-->>Report: autofix function
            Report-->>ESLint: report(messageId, fix)
        else only suggest is safe
            Fix-->>Report: suggestion function
            Report-->>ESLint: report(messageId, suggest)
        else no rewrite safe
            Report-->>ESLint: report(messageId)
        end
    end

    ESLint-->>ESLint: aggregate diagnostics
    ESLint-->>ESLint: apply --fix if enabled
```

## Safety checkpoints

- Syntax-first guards prevent expensive checker access when unnecessary.
- Type operations are wrapped with safe fallbacks to avoid linter crashes.
- Autofix only applies when parse-safe and semantic-safe constraints are met.

## Maintainer reading guide

- Focus on the `loop` body to reason about performance.
- Treat checker calls as optional/guarded operations, not defaults.
- Keep `report()` construction centralized so policy checks stay consistent.
