---
name: upgrade-docusaurus-site-polish
description: "🤖🤖 Use this prompt to upgrade an existing Docusaurus docs site into a polished, balanced, production-quality project portal with real search, strong navigation, a rich homepage, and a maintainable developer surface."
argument-hint: Provide any repo-specific branding, docs sections, developer resources, badge sources, or visual priorities to preserve or emphasize.
---

# Task: Upgrade a Docusaurus docs site into a polished project portal

You are working inside a repository that already has a Docusaurus documentation site and an existing project/package identity.

Your job is to transform the docs site from a minimal functional reference into a polished, balanced, high-quality project portal.

This prompt is **repo agnostic**. You must inspect the repository first and adapt to its real structure, scripts, sidebars, assets, and documentation conventions.

## Primary goal

Produce a Docusaurus site that feels complete, intentional, and production-quality.

The final result must:
- preserve the repository's real project/package identity
- keep existing docs routes and authored docs intact
- improve usability, navigation, homepage quality, visual hierarchy, and developer discoverability
- validate successfully with the repository's real docs/lint/test scripts

## Required outcomes

### 1. Add working search
The site must include real search.

Requirements:
- prefer a local/offline search solution if one is already installed
- if a search package is already in dependencies, wire that in instead of introducing a second search system
- place search in the navbar
- make docs, rules, presets, and blog content searchable where appropriate
- validate docs build after enabling search

### 2. Improve navigation structure
The navbar must feel balanced and deliberate.

Must-have layout:
- **Docs / Rules / Presets on the left**
- **Developer / Blog / GitHub / Search on the right**

Equivalent balanced arrangements are acceptable if the repository has different naming, but the intent must remain:
- user-facing primary docs grouped on the left
- maintainer/developer/support/navigation tools grouped on the right

### 3. Surface developer docs prominently
There must be an easy-to-find developer/maintainer path.

That can be done with:
- a dedicated navbar item or dropdown
- homepage panel(s)
- footer links
- visible links to ADRs, charts, API docs, maintainer guides, architecture notes, release/process docs, or internal references

The developer area must not be buried or effectively hidden.

### 4. Redesign the homepage
The homepage should look like a real landing page, not a placeholder.

Must-have homepage features:
- strong hero section
- logo or project mark used prominently
- concise value proposition
- feature/value cards or badges
- strong primary calls to action
- live badges/status indicators
- place live badges near the hero CTAs when that layout fits the site, instead of isolating them in a detached status block
- prefer flatter badge styles when the repository already uses them or when they visually match the site better
- for end-user-focused sites, avoid adding extra homepage sections that merely restate navigation choices when the cards themselves already communicate the path clearly
- quick-entry cards for:
  - getting started
  - presets
  - rules/rule overview
  - developer resources
  - project resources

The homepage should feel visually balanced and clearly guide both users and maintainers.

### 5. Use live badges
Add a live badge strip or badge cluster where appropriate on the homepage.

Examples of acceptable live badges:
- npm version
- npm downloads
- latest GitHub release
- GitHub stars
- GitHub open issues
- CI status
- mutation testing / coverage / security badges if the repository already supports them

Only include real, meaningful badges backed by the repository or published package.

### 6. Improve icon and logo usage
Use icons, glyphs, and logos intentionally.

Requirements:
- use the repository's real logo assets if available
- improve scannability in navbar, footer, and homepage cards
- keep icon usage tasteful and consistent
- prefer an existing symbol font or icon system already used by the site if present
- do not add noisy, random emoji clutter

### 7. Build a balanced footer
The footer should feel structured and complete, not sparse.

Recommended sections:
- **Explore**
  - overview
  - getting started
  - presets
  - rule reference
- **Project**
  - releases
  - inspector/devtools pages if available
  - API docs
  - changelog if relevant
- **Support**
  - GitHub repository
  - issues
  - security policy
  - npm/package page

Also:
- add a footer logo/brand treatment if appropriate
- keep the footer visually balanced across columns
- keep the copyright row polished

### 8. Make sidebars feel deliberate
The left docs sidebars should reflect the content hierarchy cleanly.

Requirements:
- left docs/rules/presets navigation should be coherent and easy to scan
- if the repo has maintainer/developer docs, those should be organized intentionally
- use consistent labels and icon/visual accents where appropriate
- when the repo has a stable rule catalog or rule numbering system, use that to make the left rule sidebar easier to scan
- consider rendering numeric rule markers in the sidebar in a way that feels lightweight for end users (for example `1`, `2`, `3` instead of heavier internal prefixes like `R001`, `R002` when appropriate)
- use varied left-border or accent colors for rule groups and maintainer categories when the design system supports it
- if the repository has many rule pages, make the left rule-sidebar color treatment feel alive and scan-friendly rather than one flat repeated accent
- avoid random category clutter or hidden important sections

### 9. Preserve doc integrity
Do not damage authored docs while polishing the site.

Rules:
- do not prepend raw code outside fenced code blocks
- do not break markdown structure
- do not hand-edit generated API docs unless the repo explicitly treats them as source
- if generated doc links are broken, fix the generator or post-processing source
- if preset legends, matrices, README rule tables, or other docs catalogs are generated, update the generator/source-of-truth so those surfaces stay synchronized instead of hand-editing only one copy
- preserve route integrity and sidebar correctness

### 10. Keep the site repo-aware
Before editing, inspect the repository.

At minimum, inspect:
- Docusaurus config
- sidebars
- homepage TSX/MDX/CSS
- docs workspace package.json
- static logo/icon assets
- docs scripts
- any already-installed search tooling
- any developer docs, ADRs, charts, or API docs

Do not assume all repos have the same structure.

## Reference examples to inspect

Use the repository's own assets and structure first, but inspect this reference site for concrete examples of the expected level of polish:

- `https://nick2bad4u.github.io/eslint-plugin-typefest/`

When reviewing that reference, pay attention to these patterns:
- a balanced navbar with primary docs links on the left and developer/support/search surfaces on the right
- a polished hero with strong calls to action
- live badge usage directly under or near the primary hero CTAs
- homepage cards for getting started, presets, and rules
- end-user-focused homepages that avoid unnecessary maintainer-heavy or redundant explanatory blocks below the hero
- a visible developer path
- a balanced three-column footer
- logo and icon usage that improves scannability without clutter
- a user-first docs entry route (avoid routing the main `Docs` navbar item to a developer-only landing page)
- a presets navbar dropdown that links to the overview page and the individual preset pages when the repo has multiple preset docs
- lightweight numbered rule sidebars with strong left-color accents, similar to the visual rhythm of the typefest site

Do **not** copy branding or project-specific text from the reference site.
Use it only as a quality and layout reference.

## Design expectations

- Make the site feel modern and intentional.
- Keep visual hierarchy strong.
- Use spacing, card groupings, subtle gradients, and layout balance carefully.
- Reuse existing CSS variables/design tokens when possible.
- Extend the current design language instead of bolting on a conflicting second aesthetic.
- Keep changes maintainable and readable.

## Implementation rules

- Do not rename the project/package unless explicitly requested.
- Do not change ESLint plugin namespace/rule IDs unless explicitly requested.
- Do not invent fake docs or placeholder sections.
- Do not silently remove maintainer resources.
- For end-user-focused plugin/package sites, avoid letting maintainer-heavy homepage sections dominate the first screen.
- Do not break docs build or docs typecheck.
- Prefer maintainable source changes over generated-output patching.
- If a search package is already present, use it.

## Validation requirements

After changes, run the repository's real validation commands.

At minimum, aim to verify:
- docs typecheck
- docs build
- main lint
- tests if the changed files affect tested surfaces

If package/docs metadata changes affect release surfaces, also run:
- package validation
- pack dry-run

Use the scripts that actually exist in the repository.

## Deliverables

When finished, provide:
- what you changed in the site structure
- what you changed in homepage/nav/footer/search/developer surfaces
- what scripts you ran to validate
- any remaining non-blocking warnings

## Quality bar

The final site should:
- feel intentionally designed
- guide first-time users quickly
- expose developer resources without hiding them
- use logos/icons/badges in a polished way
- have docs/rules/presets easy to find on the left
- have developer/blog/github/search discoverable on the right
- include working search
- include a balanced footer
- build cleanly with the repository's real tooling
