import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-since-tag-description",
    getPluginRule("require-since-tag-description"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Parse the given JSON string.",
                    " * @since",
                    " */",
                    "export function parseJson(input: string): unknown {",
                    "    return JSON.parse(input);",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingSinceDescription" }],
            },
            {
                code: [
                    "/**",
                    " * Parse the given JSON string.",
                    " * @since",
                    " * ```ts",
                    " * ```",
                    " */",
                    "export function parseJson(input: string): unknown {",
                    "    return JSON.parse(input);",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingSinceDescription" }],
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Parse the given JSON string.",
                    " * @since 1.2.0",
                    " */",
                    "export function parseJson(input: string): unknown {",
                    "    return JSON.parse(input);",
                    "}",
                ].join("\n"),
            },
            {
                code: [
                    "/**",
                    " * Parse the given JSON string.",
                    " * @since",
                    " * Introduced in the 1.2.0 release as a replacement for `legacyParse`.",
                    " */",
                    "export function parseJson(input: string): unknown {",
                    "    return JSON.parse(input);",
                    "}",
                ].join("\n"),
            },
            {
                code: [
                    "/**",
                    " * A constant with no @since tag.",
                    " */",
                    "export const MAX = 100;",
                ].join("\n"),
            },
        ],
    }
);
