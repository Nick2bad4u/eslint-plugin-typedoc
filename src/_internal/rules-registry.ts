/**
 * @packageDocumentation
 * Canonical runtime registry of all rule modules shipped by eslint-plugin-typedoc.
 */

import enforceTypedocTagsRule from "../rules/enforce-typedoc-tags.js";
import noTypedocTagAliasRule from "../rules/no-typedoc-tag-alias.js";
import noUnresolvedTypedocLinkRule from "../rules/no-unresolved-typedoc-link.js";
import requireExportDocsRule from "../rules/require-export-docs.js";
import requireTypedocConfigOptionsRule from "../rules/require-typedoc-config-options.js";

/** Strongly-typed registry contract for all shipped rule modules. */
export type TypedocRulesRegistry = Readonly<{
    "enforce-typedoc-tags": typeof enforceTypedocTagsRule;
    "no-typedoc-tag-alias": typeof noTypedocTagAliasRule;
    "no-unresolved-typedoc-link": typeof noUnresolvedTypedocLinkRule;
    "require-export-docs": typeof requireExportDocsRule;
    "require-typedoc-config-options": typeof requireTypedocConfigOptionsRule;
}>;

/** Runtime map of all rule modules keyed by unqualified rule name. */
export const typedocRules: TypedocRulesRegistry = {
    "enforce-typedoc-tags": enforceTypedocTagsRule,
    "no-typedoc-tag-alias": noTypedocTagAliasRule,
    "no-unresolved-typedoc-link": noUnresolvedTypedocLinkRule,
    "require-export-docs": requireExportDocsRule,
    "require-typedoc-config-options": requireTypedocConfigOptionsRule,
};

/** Unqualified rule name supported by `eslint-plugin-typedoc`. */
export type TypedocRuleName = keyof typeof typedocRules;

/** Stable ordered rule-name list for preset wiring and docs generation. */
export const typedocRuleNames: readonly TypedocRuleName[] = [
    "enforce-typedoc-tags",
    "no-typedoc-tag-alias",
    "no-unresolved-typedoc-link",
    "require-export-docs",
    "require-typedoc-config-options",
];

export default typedocRules;
