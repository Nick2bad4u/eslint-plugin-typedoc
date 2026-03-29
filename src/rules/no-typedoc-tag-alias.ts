/**
 * @packageDocumentation
 * Enforce canonical TypeDoc tag names by replacing known aliases.
 */

import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import { escapeForRegExp } from "../_internal/text-utils.js";

type MessageIds = "useCanonicalTag";
type Options = [
    Readonly<{
        aliases?: Readonly<Record<string, string>>;
    }>,
];

const defaultAliasMap: Readonly<Record<string, string>> = {
    "@arg": "@param",
    "@argument": "@param",
    "@return": "@returns",
};

const defaultOptions = [
    {
        aliases: defaultAliasMap,
    },
] satisfies Options;

const isDocComment = (comment: TSESTree.Comment): boolean =>
    comment.type === "Block" && comment.value.startsWith("*");

const noTypedocTagAliasRule: TSESLint.RuleModule<MessageIds, Options> = {
    create(context) {
        const [options = defaultOptions[0]] = context.options;
        const sourceCode = context.sourceCode;

        const configuredAliasMap = {
            ...defaultAliasMap,
            ...(options.aliases ?? {}),
        };

        const sortedAliases = Object.keys(configuredAliasMap).toSorted(
            (left, right) => right.length - left.length
        );

        if (sortedAliases.length === 0) {
            return {};
        }

        const aliasPattern = new RegExp(
            sortedAliases
                .map((alias) => `${escapeForRegExp(alias)}\\b`)
                .join("|"),
            "gu"
        );

        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    if (!isDocComment(comment)) {
                        continue;
                    }

                    for (const match of comment.value.matchAll(aliasPattern)) {
                        const aliasTag = match[0];
                        const canonicalTag = configuredAliasMap[aliasTag];

                        if (canonicalTag === undefined) {
                            continue;
                        }

                        const aliasTagOffset = match.index;

                        if (aliasTagOffset === undefined) {
                            continue;
                        }

                        const replacementStart =
                            comment.range[0] + 2 + aliasTagOffset;
                        const replacementEnd =
                            replacementStart + aliasTag.length;

                        context.report({
                            data: {
                                alias: aliasTag,
                                canonical: canonicalTag,
                            },
                            fix: (fixer) =>
                                fixer.replaceTextRange(
                                    [replacementStart, replacementEnd],
                                    canonicalTag
                                ),
                            loc: {
                                end: sourceCode.getLocFromIndex(replacementEnd),
                                start: sourceCode.getLocFromIndex(
                                    replacementStart
                                ),
                            },
                            messageId: "useCanonicalTag",
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
                "Disallow TypeDoc tag aliases and enforce canonical tags such as @param and @returns.",
            url: createRuleDocsUrl("no-typedoc-tag-alias"),
        },
        fixable: "code",
        messages: {
            useCanonicalTag:
                "Use '{{canonical}}' instead of '{{alias}}' in TypeDoc comments.",
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    aliases: {
                        additionalProperties: {
                            type: "string",
                        },
                        type: "object",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
};

export default noTypedocTagAliasRule;
