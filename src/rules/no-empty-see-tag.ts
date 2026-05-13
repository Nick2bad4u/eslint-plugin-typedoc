import { AST_TOKEN_TYPES, type TSESLint } from "@typescript-eslint/utils";

import {
    getDocCommentTagBlocks,
    hasMeaningfulTagBlockContent,
} from "../_internal/doc-tag-blocks.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "emptySeeTag";
type Options = readonly [];

/** Rule implementation for empty see-tag detection. */
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
                        if (block.tagName !== "see") {
                            continue;
                        }

                        if (hasMeaningfulTagBlockContent(block.blockText)) {
                            continue;
                        }

                        context.report({
                            loc: comment.loc,
                            messageId: "emptySeeTag",
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
            description: "disallow empty `@see` tags in TypeDoc comments.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.jsdoc",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
                "typedoc.configs.tsdoc",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-see-tag",
        },
        messages: {
            emptySeeTag:
                "`@see` tags must reference something — a URL, a symbol, or a `{@link}` expression. Remove the tag or add a reference.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-empty-see-tag",
});

export default rule;
