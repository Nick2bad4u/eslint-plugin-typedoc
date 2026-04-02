import type { TSESLint } from "@typescript-eslint/utils";

import { createRequireCommentTagDescriptionRule } from "../_internal/create-require-comment-tag-description-rule.js";

/** Rule implementation for requiring deprecated-tag descriptions. */
const rule: TSESLint.RuleModule<"missingDeprecatedDescription", readonly []> =
    createRequireCommentTagDescriptionRule({
        messageId: "missingDeprecatedDescription",
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
                    "typedoc.configs.jsdoc",
                    "typedoc.configs.markdown",
                    "typedoc.configs.recommended",
                    "typedoc.configs.strict",
                    "typedoc.configs.tsdoc",
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
        tagName: "deprecated",
    });

export default rule;
