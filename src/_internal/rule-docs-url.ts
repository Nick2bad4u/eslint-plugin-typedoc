/**
 * @packageDocumentation
 * Canonical rule documentation URL helpers for eslint-plugin-typedoc.
 */

/** Stable docs host/prefix for generated rule docs links. */
export const RULE_DOCS_URL_BASE =
    "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/" as const;

/**
 * Build the canonical documentation URL for one rule id.
 *
 * @param ruleName - Rule id (for example `enforce-typedoc-tags`).
 *
 * @returns
 *
 * @returnsssssssssss Canonical docs URL for the rule page.
 *
 * @returnsssssssss
 *
 * @returnsssssss
 *
 * @returnsssss
 *
 * @returnsss
 */
export const createRuleDocsUrl = (ruleName: string): string =>
    `${RULE_DOCS_URL_BASE}${ruleName}`;
