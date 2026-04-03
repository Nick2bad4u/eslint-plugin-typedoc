import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-deprecated-tag-description",
    getPluginRule("require-deprecated-tag-description"),
    {
        invalid: [
            {
                name: "reports missingDeprecatedDescription when @deprecated tag has no content",
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
                name: "reports missingDeprecatedDescription when @deprecated tag contains only an empty code fence",
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
                name: "is valid when @deprecated tag has inline explanation",
                code: [
                    "/**",
                    " * Legacy widget implementation.",
                    " * @deprecated Use {@link ModernWidget} instead.",
                    " */",
                    "export class LegacyWidget {}",
                ].join("\n"),
            },
            {
                name: "is valid when @deprecated tag is followed by multi-line migration guidance",
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
                name: "is valid for class without @deprecated tag",
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
