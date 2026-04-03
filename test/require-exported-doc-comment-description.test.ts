import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-exported-doc-comment-description",
    getPluginRule("require-exported-doc-comment-description"),
    {
        invalid: [
            {
                name: "reports missingExportedDocCommentDescription when JSDoc has only tag block but no description",
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
                name: "reports missingExportedDocCommentDescription when JSDoc has only @remarks but no leading description",
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
                name: "is valid when JSDoc has a leading description before the tag block",
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
                name: "is valid when JSDoc has a description followed by @remarks",
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
                name: "is valid for unexported function without any JSDoc comment",
                code: [
                    "function normalize(input: string): string {",
                    "    return input.trim();",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
