import { getPluginRule, createRuleTester } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-unknown-tags", getPluginRule("no-unknown-tags"), {
    invalid: [
        {
            code: [
                "/**",
                " * @return The normalized value.",
                " */",
                "export function normalize(value: string): string {",
                "    return value.trim();",
                "}",
            ].join("\n"),
            errors: [{ messageId: "unknownTag" }],
            output: [
                "/**",
                " * @returns The normalized value.",
                " */",
                "export function normalize(value: string): string {",
                "    return value.trim();",
                "}",
            ].join("\n"),
        },
        {
            code: [
                "/**",
                " * @notARealTag Unsupported tag.",
                " */",
                "export function run(): void {}",
            ].join("\n"),
            errors: [{ messageId: "unknownTag" }],
            output: null,
        },
    ],
    valid: [
        {
            code: [
                "/**",
                " * @returns The normalized value.",
                " */",
                "export function normalize(value: string): string {",
                "    return value.trim();",
                "}",
            ].join("\n"),
        },
    ],
});
