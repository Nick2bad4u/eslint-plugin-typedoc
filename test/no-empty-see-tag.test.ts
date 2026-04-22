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
            name: "reports emptySeeTag when @see tag has no content on a function",
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
            name: "reports emptySeeTag when @see tag contains only an empty code fence on a class",
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
            name: "is valid when @see tag contains a URL",
        },
        {
            code: [
                "/**",
                " * Widget component.",
                " * @see {@link WidgetFactory} for the preferred construction pattern.",
                " */",
                "export class Widget {}",
            ].join("\n"),
            name: "is valid when @see tag contains an inline link",
        },
        {
            code: [
                "/**",
                " * A constant with no see tag.",
                " */",
                "export const PI = 3.14159;",
            ].join("\n"),
            name: "is valid for exported constant without @see tag",
        },
    ],
});
