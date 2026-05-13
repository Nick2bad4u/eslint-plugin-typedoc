/**
 * @packageDocumentation
 * Canonical runtime registry of all rule modules shipped by eslint-plugin-typedoc.
 */

import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import * as noDuplicateParamTagsRuleModule from "../rules/no-duplicate-param-tags.js";
import * as noDuplicateTypeParamTagsRuleModule from "../rules/no-duplicate-type-param-tags.js";
import * as noEmptyExampleTagRuleModule from "../rules/no-empty-example-tag.js";
import * as noEmptyPrivateRemarksTagRuleModule from "../rules/no-empty-private-remarks-tag.js";
import * as noEmptyRemarksTagRuleModule from "../rules/no-empty-remarks-tag.js";
import * as noEmptySeeTagRuleModule from "../rules/no-empty-see-tag.js";
import * as noExtraParamTagsRuleModule from "../rules/no-extra-param-tags.js";
import * as noExtraTypeParamTagsRuleModule from "../rules/no-extra-type-param-tags.js";
import * as noMalformedInlineLinksRuleModule from "../rules/no-malformed-inline-links.js";
import * as noUnknownTagsRuleModule from "../rules/no-unknown-tags.js";
import * as preferPackageDocumentationTagRuleModule from "../rules/prefer-package-documentation-tag.js";
import * as preferTypeParamTagRuleModule from "../rules/prefer-type-param-tag.js";
import * as requireCodeFenceLanguageRuleModule from "../rules/require-code-fence-language.js";
import * as requireDefaultValueTagRuleModule from "../rules/require-default-value-tag.js";
import * as requireDeprecatedTagDescriptionRuleModule from "../rules/require-deprecated-tag-description.js";
import * as requireExampleTagRuleModule from "../rules/require-example-tag.js";
import * as requireExportedDocCommentDescriptionRuleModule from "../rules/require-exported-doc-comment-description.js";
import * as requireExportedDocCommentRuleModule from "../rules/require-exported-doc-comment.js";
import * as requirePackageDocumentationDescriptionRuleModule from "../rules/require-package-documentation-description.js";
import * as requirePackageDocumentationRuleModule from "../rules/require-package-documentation.js";
import * as requireParamTagDescriptionRuleModule from "../rules/require-param-tag-description.js";
import * as requireParamTagsRuleModule from "../rules/require-param-tags.js";
import * as requireReturnsDescriptionRuleModule from "../rules/require-returns-description.js";
import * as requireReturnsTagRuleModule from "../rules/require-returns-tag.js";
import * as requireSeeTagLinkRuleModule from "../rules/require-see-tag-link.js";
import * as requireSinceTagDescriptionRuleModule from "../rules/require-since-tag-description.js";
import * as requireThrowsDescriptionRuleModule from "../rules/require-throws-description.js";
import * as requireThrowsTagRuleModule from "../rules/require-throws-tag.js";
import * as requireTypeParamTagDescriptionRuleModule from "../rules/require-type-param-tag-description.js";
import * as requireTypeParamTagsRuleModule from "../rules/require-type-param-tags.js";
import * as typedocConfigRequiresOptionsRuleModule from "../rules/typedoc-config-requires-options.js";

/** Runtime rule module shape used by registry/preset builders. */
export type RuleWithDocs = TSESLint.RuleModule<string, Readonly<UnknownArray>>;

/** Pattern for unqualified rule names supported by `eslint-plugin-typedoc`. */
export type TypedocRuleNamePattern =
    | "no-duplicate-param-tags"
    | "no-duplicate-type-param-tags"
    | "no-empty-example-tag"
    | "no-empty-private-remarks-tag"
    | "no-empty-remarks-tag"
    | "no-empty-see-tag"
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
    | "require-see-tag-link"
    | "require-since-tag-description"
    | "require-throws-description"
    | "require-throws-tag"
    | "require-type-param-tag-description"
    | "require-type-param-tags"
    | "typedoc-config-requires-options";

/** Runtime map of all rule modules keyed by unqualified rule name. */
const typedocRuleRegistry = {
    "no-duplicate-param-tags": noDuplicateParamTagsRuleModule.default,
    "no-duplicate-type-param-tags": noDuplicateTypeParamTagsRuleModule.default,
    "no-empty-example-tag": noEmptyExampleTagRuleModule.default,
    "no-empty-private-remarks-tag": noEmptyPrivateRemarksTagRuleModule.default,
    "no-empty-remarks-tag": noEmptyRemarksTagRuleModule.default,
    "no-empty-see-tag": noEmptySeeTagRuleModule.default,
    "no-extra-param-tags": noExtraParamTagsRuleModule.default,
    "no-extra-type-param-tags": noExtraTypeParamTagsRuleModule.default,
    "no-malformed-inline-links": noMalformedInlineLinksRuleModule.default,
    "no-unknown-tags": noUnknownTagsRuleModule.default,
    "prefer-package-documentation-tag":
        preferPackageDocumentationTagRuleModule.default,
    "prefer-type-param-tag": preferTypeParamTagRuleModule.default,
    "require-code-fence-language": requireCodeFenceLanguageRuleModule.default,
    "require-default-value-tag": requireDefaultValueTagRuleModule.default,
    "require-deprecated-tag-description":
        requireDeprecatedTagDescriptionRuleModule.default,
    "require-example-tag": requireExampleTagRuleModule.default,
    "require-exported-doc-comment": requireExportedDocCommentRuleModule.default,
    "require-exported-doc-comment-description":
        requireExportedDocCommentDescriptionRuleModule.default,
    "require-package-documentation":
        requirePackageDocumentationRuleModule.default,
    "require-package-documentation-description":
        requirePackageDocumentationDescriptionRuleModule.default,
    "require-param-tag-description":
        requireParamTagDescriptionRuleModule.default,
    "require-param-tags": requireParamTagsRuleModule.default,
    "require-returns-description": requireReturnsDescriptionRuleModule.default,
    "require-returns-tag": requireReturnsTagRuleModule.default,
    "require-see-tag-link": requireSeeTagLinkRuleModule.default,
    "require-since-tag-description":
        requireSinceTagDescriptionRuleModule.default,
    "require-throws-description": requireThrowsDescriptionRuleModule.default,
    "require-throws-tag": requireThrowsTagRuleModule.default,
    "require-type-param-tag-description":
        requireTypeParamTagDescriptionRuleModule.default,
    "require-type-param-tags": requireTypeParamTagsRuleModule.default,
    "typedoc-config-requires-options":
        typedocConfigRequiresOptionsRuleModule.default,
} as const satisfies Record<TypedocRuleNamePattern, RuleWithDocs>;

/** Exported typed view consumed by the plugin entrypoint. */
export const typedocRules: Readonly<
    Record<TypedocRuleNamePattern, RuleWithDocs>
> = typedocRuleRegistry;

export default typedocRules;
