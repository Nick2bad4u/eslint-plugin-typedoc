/**
 * @packageDocumentation
 * Canonical runtime registry of all rule modules shipped by eslint-plugin-typedoc.
 */

import type { TSESLint } from "@typescript-eslint/utils";

import noDuplicateParamTagsRule from "../rules/no-duplicate-param-tags.js";
import noDuplicateTypeParamTagsRule from "../rules/no-duplicate-type-param-tags.js";
import noEmptyExampleTagRule from "../rules/no-empty-example-tag.js";
import noEmptyRemarksTagRule from "../rules/no-empty-remarks-tag.js";
import noExtraParamTagsRule from "../rules/no-extra-param-tags.js";
import noExtraTypeParamTagsRule from "../rules/no-extra-type-param-tags.js";
import noMalformedInlineLinksRule from "../rules/no-malformed-inline-links.js";
import noUnknownTagsRule from "../rules/no-unknown-tags.js";
import preferPackageDocumentationTagRule from "../rules/prefer-package-documentation-tag.js";
import preferTypeParamTagRule from "../rules/prefer-type-param-tag.js";
import requireCodeFenceLanguageRule from "../rules/require-code-fence-language.js";
import requireDefaultValueTagRule from "../rules/require-default-value-tag.js";
import requireDeprecatedTagDescriptionRule from "../rules/require-deprecated-tag-description.js";
import requireExampleTagRule from "../rules/require-example-tag.js";
import requireExportedDocCommentDescriptionRule from "../rules/require-exported-doc-comment-description.js";
import requireExportedDocCommentRule from "../rules/require-exported-doc-comment.js";
import requirePackageDocumentationDescriptionRule from "../rules/require-package-documentation-description.js";
import requirePackageDocumentationRule from "../rules/require-package-documentation.js";
import requireParamTagDescriptionRule from "../rules/require-param-tag-description.js";
import requireParamTagsRule from "../rules/require-param-tags.js";
import requireReturnsDescriptionRule from "../rules/require-returns-description.js";
import requireReturnsTagRule from "../rules/require-returns-tag.js";
import requireThrowsDescriptionRule from "../rules/require-throws-description.js";
import requireThrowsTagRule from "../rules/require-throws-tag.js";
import requireTypeParamTagDescriptionRule from "../rules/require-type-param-tag-description.js";
import requireTypeParamTagsRule from "../rules/require-type-param-tags.js";
import typedocConfigRequiresOptionsRule from "../rules/typedoc-config-requires-options.js";

/** Runtime rule module shape used by registry/preset builders. */
export type RuleWithDocs = TSESLint.RuleModule<string, readonly unknown[]>;

/** Pattern for unqualified rule names supported by `eslint-plugin-typedoc`. */
export type TypedocRuleNamePattern =
    | "no-duplicate-param-tags"
    | "no-duplicate-type-param-tags"
    | "no-empty-example-tag"
    | "no-empty-remarks-tag"
    | "no-extra-param-tags"
    | "no-extra-type-param-tags"
    | "no-malformed-inline-links"
    | "no-unknown-tags"
    | "prefer-package-documentation-tag"
    | "prefer-type-param-tag"
    | "require-code-fence-language"
    | "require-default-value-tag"
    | "require-deprecated-tag-description"
    | "require-example-tag"
    | "require-exported-doc-comment"
    | "require-exported-doc-comment-description"
    | "require-package-documentation"
    | "require-package-documentation-description"
    | "require-param-tag-description"
    | "require-param-tags"
    | "require-returns-description"
    | "require-returns-tag"
    | "require-throws-description"
    | "require-throws-tag"
    | "require-type-param-tag-description"
    | "require-type-param-tags"
    | "typedoc-config-requires-options";

/** Runtime map of all rule modules keyed by unqualified rule name. */
const typedocRuleRegistry = {
    "no-duplicate-param-tags": noDuplicateParamTagsRule,
    "no-duplicate-type-param-tags": noDuplicateTypeParamTagsRule,
    "no-empty-example-tag": noEmptyExampleTagRule,
    "no-empty-remarks-tag": noEmptyRemarksTagRule,
    "no-extra-param-tags": noExtraParamTagsRule,
    "no-extra-type-param-tags": noExtraTypeParamTagsRule,
    "no-malformed-inline-links": noMalformedInlineLinksRule,
    "no-unknown-tags": noUnknownTagsRule,
    "prefer-package-documentation-tag": preferPackageDocumentationTagRule,
    "prefer-type-param-tag": preferTypeParamTagRule,
    "require-code-fence-language": requireCodeFenceLanguageRule,
    "require-default-value-tag": requireDefaultValueTagRule,
    "require-deprecated-tag-description": requireDeprecatedTagDescriptionRule,
    "require-example-tag": requireExampleTagRule,
    "require-exported-doc-comment": requireExportedDocCommentRule,
    "require-exported-doc-comment-description":
        requireExportedDocCommentDescriptionRule,
    "require-package-documentation": requirePackageDocumentationRule,
    "require-package-documentation-description":
        requirePackageDocumentationDescriptionRule,
    "require-param-tag-description": requireParamTagDescriptionRule,
    "require-param-tags": requireParamTagsRule,
    "require-returns-description": requireReturnsDescriptionRule,
    "require-returns-tag": requireReturnsTagRule,
    "require-throws-description": requireThrowsDescriptionRule,
    "require-throws-tag": requireThrowsTagRule,
    "require-type-param-tag-description": requireTypeParamTagDescriptionRule,
    "require-type-param-tags": requireTypeParamTagsRule,
    "typedoc-config-requires-options": typedocConfigRequiresOptionsRule,
} as const satisfies Record<TypedocRuleNamePattern, RuleWithDocs>;

/** Exported typed view consumed by the plugin entrypoint. */
export const typedocRules: Readonly<
    Record<TypedocRuleNamePattern, RuleWithDocs>
> = typedocRuleRegistry;

export default typedocRules;
