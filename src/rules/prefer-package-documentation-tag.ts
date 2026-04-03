import type { TSESLint } from "@typescript-eslint/utils";

import { createPreferTagRule } from "../_internal/create-prefer-tag-rule.js";

/** Rule implementation for canonical TypeDoc package tag names. */
const rule: TSESLint.RuleModule<"preferPackageDocumentationTag", readonly []> =
    createPreferTagRule({
        fromTag: "module",
        messageId: "preferPackageDocumentationTag",
        meta: {
            docs: {
                description:
                    "enforce using `@packageDocumentation` over `@module` for package-level TypeDoc comments.",
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
                url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/prefer-package-documentation-tag",
            },
            fixable: "code",
            messages: {
                preferPackageDocumentationTag:
                    "Use `@packageDocumentation` instead of {{tag}} for canonical TypeDoc package docs.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-package-documentation-tag",
        toTag: "packageDocumentation",
    });

export default rule;
