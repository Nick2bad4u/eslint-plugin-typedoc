/**
 * @packageDocumentation
 * Shared rule creator for eslint-plugin-typedoc rules.
 */

import { ESLintUtils } from "@typescript-eslint/utils";

import type { TypedocConfigReference } from "./typedoc-config-references.js";

import { createRuleDocsUrl } from "./rule-docs-url.js";

/** Additional `meta.docs` properties carried by this plugin's rules. */
export type TypedocRuleDocs = Readonly<{
    description: string;
    frozen: boolean;
    recommended: boolean;
    requiresTypeChecking: boolean;
    typedocConfigs: readonly TypedocConfigReference[];
}>;

/**
 * Canonical rule creator that stamps `meta.docs.url` from rule names.
 */
const typedRuleCreator: ReturnType<
    typeof ESLintUtils.RuleCreator<TypedocRuleDocs>
> = ESLintUtils.RuleCreator<TypedocRuleDocs>(createRuleDocsUrl);

/** Shared RuleCreator instance that stamps canonical docs URLs. */
export const createTypedRule: typeof typedRuleCreator = typedRuleCreator;

export default createTypedRule;
