import { AST_TOKEN_TYPES, type TSESLint } from "@typescript-eslint/utils";

import {
    getDocCommentTagBlocks,
    hasMeaningfulTagBlockContent,
} from "../_internal/doc-tag-blocks.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "emptyRemarksTag";
type Options = readonly [];

/** Rule implementation for empty remarks-tag detection. */
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
                        comment.type !== AST_TOKEN_TYPES.Block ||
                        !comment.value.startsWith("*")
                    ) {
                        continue;
                    }

                    for (const block of getDocCommentTagBlocks(comment)) {
                        if (block.tagName !== "remarks") {
                            continue;
                        }

                        if (hasMeaningfulTagBlockContent(block.blockText)) {
                            continue;
                        }

                        context.report({
                            loc: comment.loc,
                            messageId: "emptyRemarksTag",
                            node: sourceCode.ast,
                        });
                    }
                }
            },
        };
    },
    meta: {
        deprecated: false,
        docs: {
            description: "disallow empty `@remarks` tags in TypeDoc comments.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.markdown",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
                "typedoc.configs.tsdoc",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-remarks-tag",
        },
        messages: {
            emptyRemarksTag:
                "`@remarks` tags must contain meaningful explanatory content, not just an empty block.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-empty-remarks-tag",
});

export default rule;
