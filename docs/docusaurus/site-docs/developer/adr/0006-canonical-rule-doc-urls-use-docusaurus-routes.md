---
title: ADR 0006 - Canonical Rule Doc URLs Use Docusaurus Routes
description: Decision record for using live Docusaurus rule pages as canonical docs URLs in rule metadata.
sidebar_position: 6
---

# ADR 0006: Use Docusaurus rule routes for `meta.docs.url`

- Status: Accepted
- Date: 2026-02-25

## Context

Rule metadata previously used GitHub blob URLs that pointed to raw markdown files (`docs/rules/*.md`).

Those links are source-oriented and not the user-facing documentation experience.

## Decision

Set canonical rule docs URLs to the live Docusaurus site routes:

- Base URL: `https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules`
- Rule URL shape: `https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/<rule-id>`

All rule metadata URL builders and tests should validate against this route format.

## Rationale

1. **Better user experience**: links open rendered docs instead of source markdown.
2. **Stable public surface**: route URLs remain canonical even if repository layout changes.
3. **Consistent metadata behavior**: editor integrations and rule docs references point to the same site.

## Consequences

- Source/tests must avoid assumptions about `.md` suffixes in docs URLs.
- Docusaurus route stability becomes part of docs-URL compatibility expectations.

## Revisit Triggers

Re-evaluate if:

- the docs site domain or route strategy changes,
- or the project intentionally moves canonical docs to another public endpoint.
