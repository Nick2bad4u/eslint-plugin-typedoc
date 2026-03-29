---
title: ADR 0009 - Plugin Blog as an Official Documentation Channel
description: Decision record for enabling and maintaining the Docusaurus blog as part of the plugin's documentation architecture.
sidebar_position: 9
---

# ADR 0009: Enable and maintain a first-party plugin blog in Docusaurus

- Status: Accepted
- Date: 2026-02-28

## Context

The repository already has strong rule reference docs and developer API/ADR pages, but lacked a channel for narrative content such as:

- architectural rationale,
- release thinking,
- migration strategy notes,
- and implementation deep dives that do not fit rule-reference pages.

Without a blog channel, this content tends to be scattered across PRs, issues, and ad hoc markdown files.

## Decision

Enable the Docusaurus blog as a first-class documentation surface, including:

- classic preset `blog` configuration,
- blog route in primary navigation,
- authors metadata (`blog/authors.yml`),
- and RSS/Atom feeds for updates.

The blog is part of docs architecture, not a separate marketing site.

## Rationale

1. **Information architecture clarity**: rule docs remain rule-specific; long-form narrative moves to blog posts.
2. **Maintainer communication**: decisions and rollout context become discoverable and linkable.
3. **Sustainable documentation**: provides a structured place for evolving guidance without bloating reference pages.

## Consequences

- The docs surface now has three complementary channels:
  - reference docs,
  - ADRs,
  - and blog posts.
- Maintainers should keep blog quality standards aligned with existing docs standards.
- Navbar/search/site build pipelines now include blog content lifecycle.

## Revisit Triggers

Re-evaluate if:

- blog content quality declines or duplicates ADR/reference docs excessively,
- maintainers choose a different channel for long-form updates,
- or docs IA changes make blog placement/navigation ineffective.
