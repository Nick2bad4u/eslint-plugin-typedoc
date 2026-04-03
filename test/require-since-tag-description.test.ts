import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-since-tag-description",
    getPluginRule("require-since-tag-description"),
    {
        invalid: [
            {
                name: "reports missingSinceDescription when @since tag has no content",
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
                name: "reports missingSinceDescription when @since tag contains only an empty code fence",
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
                name: "is valid when @since tag specifies a version string",
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
                name: "is valid when @since tag is followed by introductory prose",
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
                name: "is valid for constant without a @since tag",
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
