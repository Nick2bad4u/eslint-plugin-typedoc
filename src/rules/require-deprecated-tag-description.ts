import type { TSESLint } from "@typescript-eslint/utils";

import {
    getDocCommentTagBlocks,
    hasMeaningfulTagBlockContent,
} from "../_internal/doc-tag-blocks.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingDeprecatedDescription";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

/** Rule implementation for requiring deprecated-tag descriptions. */
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
                        if (block.tagName !== "deprecated") {
                            continue;
                        }

                        if (hasMeaningfulTagBlockContent(block.blockText)) {
                            continue;
                        }

                        context.report({
                            loc: comment.loc,
                            messageId: "missingDeprecatedDescription",
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
                "require `@deprecated` tags to explain the deprecation and, ideally, the preferred alternative.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.markdown",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-deprecated-tag-description",
        },
        messages: {
            missingDeprecatedDescription:
                "`@deprecated` tags must explain why the API is deprecated or what to use instead.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-deprecated-tag-description",
});

export default rule;
