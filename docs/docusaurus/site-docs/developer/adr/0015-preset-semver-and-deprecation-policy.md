---
title: ADR 0015 - Preset Semver and Deprecation Policy
description: Decision record for classifying preset changes under semver and requiring explicit migration guidance for disruptive transitions.
sidebar_position: 15
---

# ADR 0015: Govern preset evolution with semver-aware deprecation policy

- Status: Accepted
- Date: 2026-03-09

## Context

Preset definitions are a major user-facing contract in this plugin. Changes to preset membership can alter lint output across the existing consumer set.

Without explicit semver policy, maintainers can unintentionally ship disruptive preset changes in minor releases, creating migration friction.

## Decision

Adopt a semver-aware preset policy:

1. Breaking preset changes (key removal/rename, stricter default enablement) are treated as major-release changes.
2. Additive preset changes that preserve existing behavior can ship in minor releases.
3. Preset-impacting changes must include migration guidance in docs/changelog.
4. Ambiguous cases are escalated for architecture review before release.

## Rationale

1. **Contract clarity**: consumers need predictable expectations for preset stability.
2. **Upgrade safety**: explicit migration guidance reduces adoption risk.
3. **Release discipline**: semver classification becomes consistent across maintainers.

## Consequences

- Contributors must classify preset changes as part of PR review.
- Release notes and preset docs require synchronized updates for disruptive changes.
- Some preset changes may be deferred to planned major releases.

## Revisit Triggers

Re-evaluate if:

- the project adopts a different release model than semver,
- preset architecture is replaced by dynamic recommendation profiles,
- or user feedback indicates current deprecation windows are insufficient.
