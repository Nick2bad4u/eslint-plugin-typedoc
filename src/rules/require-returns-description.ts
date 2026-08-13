import type { TSESLint } from "@typescript-eslint/utils";

import { createRequireFunctionTagDescriptionRule } from "../_internal/create-require-function-tag-description-rule.js";

/** Rule implementation for requiring return-tag descriptions. */
const rule: TSESLint.RuleModule<"missingReturnsDescription", readonly []> =
    createRequireFunctionTagDescriptionRule({
        messageId: "missingReturnsDescription",
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require `@returns` tags to include human-readable descriptions.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typedocConfigs: [
                    "typedoc.configs.all",
                    "typedoc.configs.strict",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-returns-description",
            },
            languages: ["js/js"],
            messages: {
                missingReturnsDescription:
                    "`@returns` tags must include a description (not just a type annotation).",
            },
            schema: [],
            type: "problem",
        },
        name: "require-returns-description",
        tagNames: ["returns", "return"],
    });

export default rule;
