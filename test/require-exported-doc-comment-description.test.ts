import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-exported-doc-comment-description",
    getPluginRule("require-exported-doc-comment-description"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * @param input Parsed input value.",
                    " * @returns Normalized output value.",
                    " */",
                    "export function normalize(input: string): string {",
                    "    return input.trim();",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingExportedDocCommentDescription" }],
            },
            {
                code: [
                    "/**",
                    " * @remarks Advanced configuration surface.",
                    " */",
                    "export interface PluginOptions {",
                    "    readonly enabled: boolean;",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingExportedDocCommentDescription" }],
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Normalize user-provided input before rendering output.",
                    " * @param input Parsed input value.",
                    " * @returns Normalized output value.",
                    " */",
                    "export function normalize(input: string): string {",
                    "    return input.trim();",
                    "}",
                ].join("\n"),
            },
            {
                code: [
                    "/**",
                    " * Public options used to configure markdown generation.",
                    " *",
                    " * @remarks These options are shared across docs presets.",
                    " */",
                    "export interface PluginOptions {",
                    "    readonly enabled: boolean;",
                    "}",
                ].join("\n"),
            },
            {
                code: [
                    "function normalize(input: string): string {",
                    "    return input.trim();",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
