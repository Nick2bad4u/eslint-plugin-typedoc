---
title: ADR 0016 - Experimental Rule Admission and Skip Criteria
description: Decision record for when candidate type-fest and ts-extras migrations should ship as experimental rules versus being documented as intentionally skipped.
sidebar_position: 16
---

# ADR 0016: Admit experimental rules only when the matcher is precise and the migration is canonical

- Status: Accepted
- Date: 2026-03-22

## Context

The plugin now has an explicit `experimental` preset for lower-confidence or report-only rules.

As coverage expands across `type-fest` and `ts-extras`, maintainers will keep finding additional candidate migrations. Some of them have a clear, narrow hand-written pattern that maps cleanly to a single upstream utility. Others are conceptually related to a Type-Fest helper but show up in too many semantically different forms to make a good lint rule.

Without a documented policy, the project risks one of two failure modes:

1. shipping noisy experimental rules that users cannot trust, or
2. repeatedly re-litigating why certain candidates were intentionally skipped.

## Decision

Adopt a precision-first admission policy for experimental rules.

1. A candidate may ship in `typefest.configs.experimental` only when it has a narrow, defensible matcher and a canonical upstream replacement.
2. Experimental rules should usually begin as report-only unless the autofix is mechanically safe and equivalent.
3. If a candidate's real-world manual forms are too varied, too semantic, or too easy to mis-detect, the project should document it as intentionally skipped rather than forcing a noisy rule.
4. Skipped candidates remain eligible for future reconsideration if a tighter matcher or stronger adoption evidence emerges.

## Admission criteria

A candidate is a good experimental rule when most of the following are true:

- there is a single preferred upstream replacement,
- the manual pattern is recognizable without heroics,
- the reported message is easy to explain in one sentence,
- false positives are expected to stay low,
- the rule does not immediately require a large option surface,
- and the maintenance burden is proportionate to the value of the migration.

## Explicitly skipped examples

The following candidates were reviewed and intentionally not added in the initial experimental batch:

- `SetParameterType`
- `Jsonify`
- `SimplifyDeep`
- `Entry`
- `Entries`
- `isPropertyDefined`
- `isPropertyPresent`

These were skipped because their hand-rolled equivalents are too varied or too semantically squishy for a narrow, trustworthy rule right now. In particular, `isPropertyDefined` and `isPropertyPresent` intentionally operate on own data properties, which does not match the semantics of the common `value.property !== undefined` or `value.property != null` patterns people write by hand.

## Rationale

1. **Trust over coverage**: an experimental preset can be noisy, but it still has to be explainable and credible.
2. **Maintenance discipline**: every shipped rule adds tests, docs, snapshot surface, and future compatibility work.
3. **Better contributor guidance**: a written skip policy reduces repeated discussions about why some upstream utilities still do not have a rule.
4. **Promotion path clarity**: strong experimental rules can later graduate into stable presets; weak ones should not be shipped just to increase nominal coverage.

## Consequences

- Contributors should justify new experimental rules using matcher precision, not just upstream API coverage.
- Some real Type-Fest and `ts-extras` utilities will remain intentionally uncovered until stronger patterns are demonstrated.
- Experimental preset docs should link to this decision when explaining why some candidates are present and others are not.

## Revisit Triggers

Re-evaluate this decision if:

- repeated user demand clusters around one skipped candidate,
- upstream Type-Fest or `ts-extras` documentation establishes a clearer canonical migration shape,
- or the plugin gains shared matcher infrastructure that materially lowers false-positive risk for currently skipped candidates.
