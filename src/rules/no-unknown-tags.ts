/**
 * @packageDocumentation
 * Disallow unknown tags in TypeDoc comments.
 */

import type { TSESLint } from "@typescript-eslint/utils";

import { getDocCommentTagMatches } from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const defaultOptions = [] as const;

type MessageIds = "unknownTag";
type Options = typeof defaultOptions;

const allowedTags = new Set([
    "alpha",
    "beta",
    "category",
    "defaultValue",
    "deprecated",
    "event",
    "example",
    "experimental",
    "group",
    "hidden",
    "ignore",
    "inheritDoc",
    "inline",
    "internal",
    "label",
    "license",
    "link",
    "module",
    "packageDocumentation",
    "param",
    "privateRemarks",
    "remarks",
    "returns",
    "see",
    "template",
    "throws",
    "typeParam",
    "virtual",
]);

const aliasTagsByUnknownTag = {
    arg: "param",
    argument: "param",
    return: "returns",
} as const satisfies Record<string, string>;

const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create: (context) => {
        const { sourceCode } = context;

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
                        if (allowedTags.has(tagMatch.name)) {
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
        docs: {
            description:
                "Disallow unknown TypeDoc tags and normalize common aliases.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.minimal",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
                "typedoc.configs.all",
            ],
        },
        fixable: "code",
        messages: {
            unknownTag:
                "Unknown TypeDoc tag '{{tag}}'. Replace it with a supported TypeDoc tag.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-unknown-tags",
});

export default rule;
