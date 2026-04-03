import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("require-see-tag-link", getPluginRule("require-see-tag-link"), {
    invalid: [
        {
            name: "reports missingSeeLinkOrUrl when @see tag contains prose but no URL or {@link}",
            code: [
                "/**",
                " * Normalize user-provided input.",
                " * @see String trimming documentation",
                " */",
                "export function normalize(input: string): string {",
                "    return input.trim();",
                "}",
            ].join("\n"),
            errors: [{ messageId: "missingSeeLinkOrUrl" }],
        },
        {
            name: "reports missingSeeLinkOrUrl when @see contains multi-line prose description without a link",
            code: [
                "/**",
                " * Widget component.",
                " * @see",
                " * Related widget factory.",
                " */",
                "export class Widget {}",
            ].join("\n"),
            errors: [{ messageId: "missingSeeLinkOrUrl" }],
        },
    ],
    valid: [
        {
            name: "is valid when @see tag contains an absolute HTTPS URL",
            code: [
                "/**",
                " * Normalize user-provided input.",
                " * @see https://developer.mozilla.org/en-US/docs/Web/API/String/trim",
                " */",
                "export function normalize(input: string): string {",
                "    return input.trim();",
                "}",
            ].join("\n"),
        },
        {
            name: "is valid when @see tag contains an inline {@link} reference",
            code: [
                "/**",
                " * Widget component.",
                " * @see {@link WidgetFactory} for the preferred construction pattern.",
                " */",
                "export class Widget {}",
            ].join("\n"),
        },
        {
            name: "is valid when @see tag contains an FTP URL",
            code: [
                "/**",
                " * Fetch data from the remote API.",
                " * @see ftp://files.example.com/api-spec.json",
                " */",
                "export async function fetchData(): Promise<unknown> {",
                "    return fetch('/api/data').then((r) => r.json());",
                "}",
            ].join("\n"),
        },
        {
            name: "is valid for constant without @see tag",
            // Empty @see is handled by no-empty-see-tag, not this rule
            code: [
                "/**",
                " * A constant with no see tag.",
                " */",
                "export const PI = 3.14159;",
            ].join("\n"),
        },
        {
            name: "is valid when @see tag is empty (handled by no-empty-see-tag, out of scope here)",
            // Empty @see is out of scope for this rule
            code: [
                "/**",
                " * Something.",
                " * @see",
                " */",
                "export const X = 1;",
            ].join("\n"),
        },
    ],
});
