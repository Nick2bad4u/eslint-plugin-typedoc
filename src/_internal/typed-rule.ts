/**
 * @packageDocumentation
 * Shared rule creator for eslint-plugin-typedoc rules.
 */

import { ESLintUtils } from "@typescript-eslint/utils";

import type { TypedocConfigReference } from "./typedoc-config-references.js";

import { createRuleDocsUrl } from "./rule-docs-url.js";

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
const typedRuleCreator = ESLintUtils.RuleCreator<TypedocRuleDocs>(
    createRuleDocsUrl
) as ReturnType<typeof ESLintUtils.RuleCreator<TypedocRuleDocs>>;

export const createTypedRule: typeof typedRuleCreator = typedRuleCreator;

export default createTypedRule;
