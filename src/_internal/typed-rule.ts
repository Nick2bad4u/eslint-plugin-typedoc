/**
 * @packageDocumentation
 * Shared rule creator for eslint-plugin-typedoc rules.
 */

import type { UnknownArray } from "type-fest";

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

type TypedRuleCreator = <
    TOptions extends Readonly<UnknownArray>,
    TMessageIds extends string,
>(
    rule: Readonly<TypedRuleWithMetaAndName<TOptions, TMessageIds>>
) => TypedRuleModule<TOptions, TMessageIds> & {
    name: string;
};

type TypedRuleModule<
    TOptions extends Readonly<UnknownArray>,
    TMessageIds extends string,
> = ESLintUtils.RuleModule<TMessageIds, TOptions, TypedocRuleDocs>;

type TypedRuleWithMetaAndName<
    TOptions extends Readonly<UnknownArray>,
    TMessageIds extends string,
> = ESLintUtils.RuleWithMetaAndName<TOptions, TMessageIds, TypedocRuleDocs>;

/**
 * Canonical rule creator that stamps `meta.docs.url` from rule names.
 */
const typedRuleCreator: TypedRuleCreator =
    ESLintUtils.RuleCreator(createRuleDocsUrl);

/** Shared RuleCreator instance that stamps canonical docs URLs. */
export const createTypedRule: TypedRuleCreator = typedRuleCreator;

export default createTypedRule;
