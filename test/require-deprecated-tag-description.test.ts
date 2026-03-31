import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-deprecated-tag-description",
    getPluginRule("require-deprecated-tag-description"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Legacy widget implementation.",
                    " * @deprecated",
                    " */",
                    "export class LegacyWidget {}",
                ].join("\n"),
                errors: [{ messageId: "missingDeprecatedDescription" }],
            },
            {
                code: [
                    "/**",
                    " * Legacy widget implementation.",
                    " * @deprecated",
                    " * ```ts",
                    " * ```",
                    " */",
                    "export class LegacyWidget {}",
                ].join("\n"),
                errors: [{ messageId: "missingDeprecatedDescription" }],
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Legacy widget implementation.",
                    " * @deprecated Use {@link ModernWidget} instead.",
                    " */",
                    "export class LegacyWidget {}",
                ].join("\n"),
            },
            {
                code: [
                    "/**",
                    " * Legacy widget implementation.",
                    " * @deprecated",
                    " * This implementation will be removed in v2.",
                    " * Migrate to {@link ModernWidget} before upgrading.",
                    " */",
                    "export class LegacyWidget {}",
                ].join("\n"),
            },
            {
                code: [
                    "/**",
                    " * Modern widget implementation.",
                    " */",
                    "export class ModernWidget {}",
                ].join("\n"),
            },
        ],
    }
);
