/**
 * @packageDocumentation
 * Disallow unknown tags in TypeDoc comments.
 */

import type { TSESLint } from "@typescript-eslint/utils";

import { getDocCommentTagMatches } from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Shape of the optional first config element accepted by this rule. */
type AdditionalTagsOption = {
    /**
     * Extra tag names (without `@`) to allow in addition to TypeDoc's built-in
     * supported tag set. Use this when your project defines custom tags via
     * plugins or a `tsdoc.json` configuration.
     */
    readonly additionalTags?: readonly string[];
};

type MessageIds = "unknownTag";
type Options = readonly [AdditionalTagsOption?];

const defaultOptions = [] as const satisfies Options;

const supportedTypeDocTagNames = [
    "abstract",
    "alpha",
    "author",
    "augments",
    "beta",
    "callback",
    "category",
    "categoryDescription",
    "class",
    "default",
    "defaultValue",
    "deprecated",
    "disableGroups",
    "document",
    "enum",
    "event",
    "eventProperty",
    "example",
    "expand",
    "expandType",
    "experimental",
    "extends",
    "function",
    "group",
    "groupDescription",
    "hidden",
    "hideCategories",
    "hideGroups",
    "hideconstructor",
    "ignore",
    "import",
    "include",
    "includeCode",
    "inheritDoc",
    "inline",
    "inlineType",
    "interface",
    "internal",
    "jsx",
    "label",
    "license",
    "link",
    "linkcode",
    "linkplain",
    "mergeModuleWith",
    "module",
    "namespace",
    "overload",
    "override",
    "packageDocumentation",
    "param",
    "preventExpand",
    "preventInline",
    "primaryExport",
    "private",
    "privateRemarks",
    "prop",
    "property",
    "protected",
    "public",
    "readonly",
    "remarks",
    "return",
    "returns",
    "satisfies",
    "sealed",
    "see",
    "showCategories",
    "showGroups",
    "since",
    "sortStrategy",
    "summary",
    "template",
    "this",
    "throws",
    "type",
    "typedef",
    "typeParam",
    "useDeclaredType",
    "virtual",
    "yields",
] as const satisfies readonly string[];

const aliasTagsByUnknownTag = {
    arg: "param",
    argument: "param",
    inheritdoc: "inheritDoc",
    return: "returns",
} as const satisfies Record<string, string>;

const tagsHandledByAliasFixes = new Set<string>(
    Object.keys(aliasTagsByUnknownTag)
);

const allowedTags = new Set<string>(
    supportedTypeDocTagNames.filter(
        (tagName) => !tagsHandledByAliasFixes.has(tagName)
    )
);

/** Rule implementation for unknown TypeDoc tag detection. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create: (context) => {
        const { sourceCode } = context;
        const userTags = context.options[0]?.additionalTags ?? [];
        const effectiveAllowedTags =
            userTags.length > 0
                ? new Set([...allowedTags, ...userTags])
                : allowedTags;

        return {
            Program: (): void => {
                for (const comment of sourceCode.getAllComments()) {
                    if (
                        comment.type !== "Block" ||
                        !comment.value.startsWith("*")
                    ) {
                        continue;
                    }

                    for (const tagMatch of getDocCommentTagMatches(
                        sourceCode,
                        comment
                    )) {
                        if (effectiveAllowedTags.has(tagMatch.name)) {
                            continue;
                        }

                        const [absoluteStart, absoluteEnd] =
                            tagMatch.absoluteRange;
                        const canonicalTagName =
                            aliasTagsByUnknownTag[
                                tagMatch.name as keyof typeof aliasTagsByUnknownTag
                            ];

                        const baseReportDescriptor = {
                            data: {
                                tag: `@${tagMatch.name}`,
                            },
                            loc: {
                                end: sourceCode.getLocFromIndex(absoluteEnd),
                                start: sourceCode.getLocFromIndex(
                                    absoluteStart
                                ),
                            },
                            messageId: "unknownTag" as const,
                            node: sourceCode.ast,
                        };

                        if (canonicalTagName === undefined) {
                            context.report(baseReportDescriptor);

                            continue;
                        }

                        context.report({
                            ...baseReportDescriptor,
                            fix: (fixer) =>
                                fixer.replaceTextRange(
                                    [
                                        absoluteStart + 1,
                                        absoluteStart +
                                            1 +
                                            tagMatch.name.length,
                                    ],
                                    canonicalTagName
                                ),
                        });
                    }
                }
            },
        };
    },
    defaultOptions,
    meta: {
        defaultOptions: [{}],
        deprecated: false,
        docs: {
            description:
                "disallow unknown TypeDoc tags and normalize common aliases.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.minimal",
                "typedoc.configs.jsdoc",
                "typedoc.configs.markdown",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
                "typedoc.configs.all",
                "typedoc.configs.tsdoc",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-unknown-tags",
        },
        fixable: "code",
        messages: {
            unknownTag:
                "Unknown TypeDoc tag '{{tag}}'. Replace it with a supported TypeDoc tag.",
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    additionalTags: {
                        description:
                            "Extra tag names (without @) to allow in addition to TypeDoc's built-in supported tag set.",
                        items: { type: "string" },
                        type: "array",
                        uniqueItems: true,
                    },
                },
                type: "object",
            },
        ],
        type: "problem",
    },
    name: "no-unknown-tags",
});

export default rule;
