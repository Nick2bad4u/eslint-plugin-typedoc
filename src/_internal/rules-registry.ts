/**
 * @packageDocumentation
 * Canonical runtime registry of all rule modules shipped by eslint-plugin-typedoc.
 */

import type { TSESLint } from "@typescript-eslint/utils";

import noMalformedInlineLinksRule from "../rules/no-malformed-inline-links.js";
import noUnknownTagsRule from "../rules/no-unknown-tags.js";
import requireExportedDocCommentRule from "../rules/require-exported-doc-comment.js";
import requireParamTagsRule from "../rules/require-param-tags.js";
import requireReturnsTagRule from "../rules/require-returns-tag.js";
import typedocConfigRequiresOptionsRule from "../rules/typedoc-config-requires-options.js";

/** Runtime rule module shape used by registry/preset builders. */
export type RuleWithDocs = TSESLint.RuleModule<string, readonly unknown[]>;

/** Pattern for unqualified rule names supported by `eslint-plugin-typedoc`. */
export type TypedocRuleNamePattern =
    | "no-malformed-inline-links"
    | "no-unknown-tags"
    | "require-exported-doc-comment"
    | "require-param-tags"
    | "require-returns-tag"
    | "typedoc-config-requires-options";

/** Runtime map of all rule modules keyed by unqualified rule name. */
const typedocRuleRegistry = {
    "no-malformed-inline-links": noMalformedInlineLinksRule,
    "no-unknown-tags": noUnknownTagsRule,
    "require-exported-doc-comment": requireExportedDocCommentRule,
    "require-param-tags": requireParamTagsRule,
    "require-returns-tag": requireReturnsTagRule,
    "typedoc-config-requires-options": typedocConfigRequiresOptionsRule,
} as const satisfies Record<TypedocRuleNamePattern, RuleWithDocs>;

/** Exported typed view consumed by the plugin entrypoint. */
export const typedocRules = typedocRuleRegistry;

export default typedocRules;
