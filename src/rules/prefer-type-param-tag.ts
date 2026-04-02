import type { TSESLint } from "@typescript-eslint/utils";

import { createPreferTagRule } from "../_internal/create-prefer-tag-rule.js";

/** Rule implementation for canonical TypeDoc generic tag names. */
const rule: TSESLint.RuleModule<"preferTypeParamTag", readonly []> =
    createPreferTagRule({
        fromTag: "template",
        messageId: "preferTypeParamTag",
        meta: {
            deprecated: false,
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
                    "typedoc.configs.tsdoc",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/prefer-type-param-tag",
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
        toTag: "typeParam",
    });

export default rule;
