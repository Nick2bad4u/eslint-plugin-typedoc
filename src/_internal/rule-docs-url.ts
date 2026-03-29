/**
 * @packageDocumentation
 * Canonical rule-doc URL builder for eslint-plugin-typedoc.
 */

const RULE_DOCS_BASE_URL =
    "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules";

/**
 * Build the canonical documentation URL for a rule.
 *
 * @param ruleName - Unqualified rule name.
 *
 * @returns Absolute docs URL.
 */
export const createRuleDocsUrl = (ruleName: string): string =>
    `${RULE_DOCS_BASE_URL}/${ruleName}`;

export default createRuleDocsUrl;
