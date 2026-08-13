import type { TSESLint } from "@typescript-eslint/utils";

import { createRequireCommentTagDescriptionRule } from "../_internal/create-require-comment-tag-description-rule.js";

/** Rule implementation for requiring since-tag descriptions. */
const rule: TSESLint.RuleModule<"missingSinceDescription", readonly []> =
    createRequireCommentTagDescriptionRule({
        messageId: "missingSinceDescription",
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require `@since` tags to specify a version or introductory context.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typedocConfigs: [
                    "typedoc.configs.all",
                    "typedoc.configs.strict",
                    "typedoc.configs.tsdoc",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-since-tag-description",
            },
            languages: ["js/js"],
            messages: {
                missingSinceDescription:
                    "`@since` tags must specify a version string or introductory context (e.g. `@since 1.4.0`).",
            },
            schema: [],
            type: "problem",
        },
        name: "require-since-tag-description",
        tagName: "since",
    });

export default rule;
