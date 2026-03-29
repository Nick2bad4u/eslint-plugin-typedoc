---
title: ADR 0011 - Type-Aware Rule Contract and Fail-Fast Behavior
description: Decision record for requiring parser services in typed rules and failing fast when type-aware lint context is missing.
sidebar_position: 11
---

# ADR 0011: Require parser services for typed rules and fail fast when unavailable

- Status: Accepted
- Date: 2026-02-28

## Context

A substantial part of this plugin depends on TypeScript semantic information for correctness. Some rule decisions cannot be made safely from syntax alone.

The repository already provides shared typed-rule helpers and explicitly throws when `parserServices.program` is unavailable.

Without a strict contract, typed rules risk silently degrading into incorrect behavior or inconsistent reports.

## Decision

Adopt a strict type-aware rule contract:

1. Typed rules use shared helper APIs (`getTypedRuleServices`, `createTypedRule`).
2. When semantic context is required and unavailable, rule helpers fail fast with an explicit error.
3. Rule metadata must accurately declare type-checking requirements.

## Rationale

1. **Correctness first**: semantic rules should never run in partially initialized mode.
2. **Debuggability**: explicit failure is easier to diagnose than silent false positives/negatives.
3. **Consistency**: shared helper usage enforces one behavior model across all typed rules.

## Consequences

- Lint configuration must provide the parser-service context expected by typed rules.
- Typed rule tests and fixtures remain part of the plugin’s core quality model.
- Contributors should not bypass typed-rule helpers for one-off implementations.

## Revisit Triggers

Re-evaluate if:

- TypeScript-ESLint exposes a safer fallback model for semantic rules,
- plugin scope changes reduce reliance on semantic analysis,
- or helper abstractions no longer match upstream parser-service APIs.
