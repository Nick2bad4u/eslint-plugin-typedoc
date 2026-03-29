/**
 * @packageDocumentation
 * Shared rule creator for eslint-plugin-typedoc rules.
 */

import { ESLintUtils } from "@typescript-eslint/utils";

import { createRuleDocsUrl } from "./rule-docs-url.js";
import type { TypedocConfigReference } from "./typedoc-config-references.js";

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
export const createTypedRule =
    ESLintUtils.RuleCreator<TypedocRuleDocs>(createRuleDocsUrl);

export default createTypedRule;
