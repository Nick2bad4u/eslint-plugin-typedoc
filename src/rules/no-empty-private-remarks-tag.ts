import { AST_TOKEN_TYPES, type TSESLint } from "@typescript-eslint/utils";

import {
    getDocCommentTagBlocks,
    hasMeaningfulTagBlockContent,
} from "../_internal/doc-tag-blocks.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "emptyPrivateRemarksTag";
type Options = readonly [];

/** Rule implementation for empty privateRemarks-tag detection. */
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
                        if (block.tagName !== "privateRemarks") {
                            continue;
                        }

                        if (hasMeaningfulTagBlockContent(block.blockText)) {
                            continue;
                        }

                        context.report({
                            loc: comment.loc,
                            messageId: "emptyPrivateRemarksTag",
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
            description:
                "disallow empty `@privateRemarks` tags in TypeDoc comments.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-private-remarks-tag",
        },
        messages: {
            emptyPrivateRemarksTag:
                "`@privateRemarks` tags must contain meaningful content. Remove the tag if there are no internal notes to add.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-empty-private-remarks-tag",
});

export default rule;
