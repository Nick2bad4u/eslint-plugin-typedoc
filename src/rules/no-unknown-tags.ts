/**
 * @packageDocumentation
 * Disallow unknown tags in TypeDoc comments.
 */

import { AST_TOKEN_TYPES, type TSESLint } from "@typescript-eslint/utils";
import { arrayFirst, isDefined, not, setHas } from "ts-extras";

import { getDocCommentTagMatches } from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Shape of the optional first config element accepted by this rule. */
interface AdditionalTagsOption {
    /**
     * Extra tag names (without `@`) to allow in addition to TypeDoc's built-in
     * supported tag set. Use this when your project defines custom tags via
     * plugins or a `tsdoc.json` configuration.
     */
    readonly additionalTags?: readonly string[];
}

type MessageIds = "unknownTag";
type Options = readonly [AdditionalTagsOption?];

const supportedTypeDocTagNames = [
    "abstract",
    "alpha",
    "augments",
    "author",
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
    "hideconstructor",
    "hideGroups",
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

const aliasTagsByUnknownTag = new Map<string, string>([
    ["arg", "param"],
    ["argument", "param"],
    ["inheritdoc", "inheritDoc"],
    ["return", "returns"],
]);

const tagsHandledByAliasFixes = new Set<string>(aliasTagsByUnknownTag.keys());

const allowedTags = new Set<string>(
    supportedTypeDocTagNames.filter(
        not((tagName) => setHas(tagsHandledByAliasFixes, tagName))
    )
);

/** Rule implementation for unknown TypeDoc tag detection. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create: (context) => {
        const { sourceCode } = context;
        const userTags = arrayFirst(context.options)?.additionalTags ?? [];
        const effectiveAllowedTags =
            userTags.length > 0
                ? new Set([...allowedTags, ...userTags])
                : allowedTags;

        return {
            Program: (): void => {
                for (const comment of sourceCode.getAllComments()) {
                    if (
                        comment.type !== AST_TOKEN_TYPES.Block ||
                        !comment.value.startsWith("*")
                    ) {
                        continue;
                    }

                    for (const tagMatch of getDocCommentTagMatches(
                        sourceCode,
                        comment
                    )) {
                        if (setHas(effectiveAllowedTags, tagMatch.name)) {
                            continue;
                        }

                        const [absoluteStart, absoluteEnd] =
                            tagMatch.absoluteRange;
                        const canonicalTagName = aliasTagsByUnknownTag.get(
                            tagMatch.name
                        );

                        const baseReportDescriptor = {
                            data: {
                                tag: `@${String(tagMatch.name)}`,
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

                        if (!isDefined(canonicalTagName)) {
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
