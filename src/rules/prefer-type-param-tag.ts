import type { TSESLint } from "@typescript-eslint/utils";

import { getDocCommentTagMatches } from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "preferTypeParamTag";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

/** Rule implementation for canonical TypeDoc generic tag names. */
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
                        if (tagMatch.name !== "template") {
                            continue;
                        }

                        const [absoluteStart, absoluteEnd] =
                            tagMatch.absoluteRange;

                        context.report({
                            data: {
                                tag: "@template",
                            },
                            fix: (fixer) =>
                                fixer.replaceTextRange(
                                    [
                                        absoluteStart + 1,
                                        absoluteStart +
                                            1 +
                                            tagMatch.name.length,
                                    ],
                                    "typeParam"
                                ),
                            loc: {
                                end: sourceCode.getLocFromIndex(absoluteEnd),
                                start: sourceCode.getLocFromIndex(
                                    absoluteStart
                                ),
                            },
                            messageId: "preferTypeParamTag",
                            node: sourceCode.ast,
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
                "enforce using `@typeParam` over `@template` for generic TypeDoc documentation.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
            ],
        },
        fixable: "code",
        messages: {
            preferTypeParamTag:
                "Use `@typeParam` instead of {{tag}} to match canonical TypeDoc style.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-type-param-tag",
});

export default rule;
