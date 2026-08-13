import type { TSESLint } from "@typescript-eslint/utils";

import { createRequireFunctionTagDescriptionRule } from "../_internal/create-require-function-tag-description-rule.js";

/** Rule implementation for requiring throws-tag descriptions. */
const rule: TSESLint.RuleModule<"missingThrowsDescription", readonly []> =
    createRequireFunctionTagDescriptionRule({
        messageId: "missingThrowsDescription",
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require `@throws` tags to include human-readable descriptions.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typedocConfigs: [
                    "typedoc.configs.all",
                    "typedoc.configs.strict",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-throws-description",
            },
            languages: ["js/js"],
            messages: {
                missingThrowsDescription:
                    "`@throws` tags must include a description (not just an error type).",
            },
            schema: [],
            type: "problem",
        },
        name: "require-throws-description",
        tagNames: ["throws", "throw"],
    });

export default rule;
