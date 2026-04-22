import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-empty-private-remarks-tag",
    getPluginRule("no-empty-private-remarks-tag"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Normalize user-provided input.",
                    " * @privateRemarks",
                    " */",
                    "export function normalize(input: string): string {",
                    "    return input.trim();",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "emptyPrivateRemarksTag" }],
                name: "reports emptyPrivateRemarksTag when @privateRemarks tag has no content",
            },
            {
                code: [
                    "/**",
                    " * Normalize user-provided input.",
                    " * @privateRemarks",
                    " * ```md",
                    " * ```",
                    " */",
                    "export function normalize(input: string): string {",
                    "    return input.trim();",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "emptyPrivateRemarksTag" }],
                name: "reports emptyPrivateRemarksTag when @privateRemarks tag contains only an empty code fence",
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Normalize user-provided input.",
                    " * @privateRemarks Internal-only: do not expose in generated docs.",
                    " */",
                    "export function normalize(input: string): string {",
                    "    return input.trim();",
                    "}",
                ].join("\n"),
                name: "is valid when @privateRemarks tag has inline content on same line",
            },
            {
                code: [
                    "/**",
                    " * Normalize user-provided input.",
                    " * @privateRemarks",
                    " * This function has a known edge case when input contains only",
                    " * non-breaking spaces — tracked in issue #42.",
                    " */",
                    "export function normalize(input: string): string {",
                    "    return input.trim();",
                    "}",
                ].join("\n"),
                name: "is valid when @privateRemarks tag is followed by multi-line prose",
            },
            {
                code: [
                    "/**",
                    " * A public constant with no private remarks.",
                    " */",
                    "export const PI = 3.14159;",
                ].join("\n"),
                name: "is valid for exported constant without @privateRemarks tag",
            },
        ],
    }
);
