import type { TSESLint } from "@typescript-eslint/utils";

import { getDocCommentTagMatches } from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "preferPackageDocumentationTag";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

/** Rule implementation for canonical TypeDoc package tag names. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            Program(): void {
                for (const comment of sourceCode.getAllComments()) {
                    if (
                        comment.type !== "Block" ||
                        !comment.value.startsWith("*")
                    ) {
                        continue;
                    }

                    const tagMatches = getDocCommentTagMatches(
                        sourceCode,
                        comment
                    );

                    for (const tagMatch of tagMatches) {
                        if (tagMatch.name !== "module") {
                            continue;
                        }

                        const [absoluteStart, absoluteEnd] =
                            tagMatch.absoluteRange;

                        context.report({
                            data: {
                                tag: "@module",
                            },
                            fix: (fixer) =>
                                fixer.replaceTextRange(
                                    [
                                        absoluteStart + 1,
                                        absoluteStart +
                                            1 +
                                            tagMatch.name.length,
                                    ],
                                    "packageDocumentation"
                                ),
                            loc: {
                                end: sourceCode.getLocFromIndex(absoluteEnd),
                                start: sourceCode.getLocFromIndex(
                                    absoluteStart
                                ),
                            },
                            messageId: "preferPackageDocumentationTag",
                            node: sourceCode.ast,
                        });
                    }
                }
            },
        };
    },
    defaultOptions,
    meta: {
        deprecated: false,
        docs: {
            description:
                "enforce using `@packageDocumentation` over `@module` for package-level TypeDoc comments.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/prefer-package-documentation-tag",
        },
        fixable: "code",
        messages: {
            preferPackageDocumentationTag:
                "Use `@packageDocumentation` instead of {{tag}} for canonical TypeDoc package docs.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-package-documentation-tag",
});

export default rule;
