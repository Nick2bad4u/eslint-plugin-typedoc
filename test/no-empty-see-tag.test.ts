import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-empty-see-tag", getPluginRule("no-empty-see-tag"), {
    invalid: [
        {
            code: [
                "/**",
                " * Normalize user-provided input.",
                " * @see",
                " */",
                "export function normalize(input: string): string {",
                "    return input.trim();",
                "}",
            ].join("\n"),
            errors: [{ messageId: "emptySeeTag" }],
        },
        {
            code: [
                "/**",
                " * Widget component.",
                " * @see",
                " * ```md",
                " * ```",
                " */",
                "export class Widget {}",
            ].join("\n"),
            errors: [{ messageId: "emptySeeTag" }],
        },
    ],
    valid: [
        {
            code: [
                "/**",
                " * Normalize user-provided input.",
                " * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim",
                " */",
                "export function normalize(input: string): string {",
                "    return input.trim();",
                "}",
            ].join("\n"),
        },
        {
            code: [
                "/**",
                " * Widget component.",
                " * @see {@link WidgetFactory} for the preferred construction pattern.",
                " */",
                "export class Widget {}",
            ].join("\n"),
        },
        {
            code: [
                "/**",
                " * A constant with no see tag.",
                " */",
                "export const PI = 3.14159;",
            ].join("\n"),
        },
    ],
});
