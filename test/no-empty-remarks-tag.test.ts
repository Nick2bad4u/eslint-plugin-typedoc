import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-empty-remarks-tag", getPluginRule("no-empty-remarks-tag"), {
    invalid: [
        {
            code: [
                "/**",
                " * Normalize user-provided input.",
                " * @remarks",
                " */",
                "export function normalize(input: string): string {",
                "    return input.trim();",
                "}",
            ].join("\n"),
            errors: [{ messageId: "emptyRemarksTag" }],
        },
        {
            code: [
                "/**",
                " * Normalize user-provided input.",
                " * @remarks",
                " * ```md",
                " * ```",
                " */",
                "export function normalize(input: string): string {",
                "    return input.trim();",
                "}",
            ].join("\n"),
            errors: [{ messageId: "emptyRemarksTag" }],
        },
    ],
    valid: [
        {
            code: [
                "/**",
                " * Normalize user-provided input.",
                " * @remarks Trims surrounding whitespace before returning the value.",
                " */",
                "export function normalize(input: string): string {",
                "    return input.trim();",
                "}",
            ].join("\n"),
        },
        {
            code: [
                "/**",
                " * Normalize user-provided input.",
                " * @remarks",
                " * ```ts",
                ' * const value = normalize("  example  ");',
                " * ```",
                " */",
                "export function normalize(input: string): string {",
                "    return input.trim();",
                "}",
            ].join("\n"),
        },
    ],
});
