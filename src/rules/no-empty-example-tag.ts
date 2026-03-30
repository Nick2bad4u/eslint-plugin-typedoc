import type { TSESLint } from "@typescript-eslint/utils";

import { getDocCommentTagBlocks } from "../_internal/doc-tag-blocks.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "emptyExampleTag";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

const hasMeaningfulExampleContent = (exampleText: string): boolean => {
    const normalizedLines = exampleText
        .replaceAll("\r\n", "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter(
            (line) =>
                line.length > 0 && line !== "```" && !line.startsWith("```")
        );

    return normalizedLines.length > 0;
};

/** Rule implementation for empty example-tag detection. */
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

                    for (const block of getDocCommentTagBlocks(comment)) {
                        if (block.tagName !== "example") {
                            continue;
                        }

                        if (hasMeaningfulExampleContent(block.blockText)) {
                            continue;
                        }

                        context.report({
                            messageId: "emptyExampleTag",
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
            description: "disallow empty `@example` tags in TypeDoc comments.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
            ],
        },
        messages: {
            emptyExampleTag:
                "`@example` tags must contain example content, not just an empty block.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-empty-example-tag",
});

export default rule;
