/**
 * @packageDocumentation
 * Shared rule creator for eslint-plugin-typedoc rules.
 */

import type { Merge, UnknownArray } from "type-fest";

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

/** ESLint 10 rule metadata, including the language compatibility contract. */
export type TypedRuleMeta<
    TOptions extends Readonly<UnknownArray>,
    TMessageIds extends string,
> = Merge<
    ESLintUtils.RuleWithMetaAndName<
        TOptions,
        TMessageIds,
        TypedocRuleDocs
    >["meta"],
    Readonly<{
        languages: readonly string[];
    }>
>;

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
> = Merge<
    ESLintUtils.RuleWithMetaAndName<TOptions, TMessageIds, TypedocRuleDocs>,
    Readonly<{
        meta: TypedRuleMeta<TOptions, TMessageIds>;
    }>
>;

/**
 * Canonical rule creator that stamps `meta.docs.url` from rule names.
 */
const { RuleCreator: createRuleCreator } = ESLintUtils;

const typedRuleCreator: TypedRuleCreator = createRuleCreator(createRuleDocsUrl);

/** Shared RuleCreator instance that stamps canonical docs URLs. */
export const createTypedRule: TypedRuleCreator = typedRuleCreator;
