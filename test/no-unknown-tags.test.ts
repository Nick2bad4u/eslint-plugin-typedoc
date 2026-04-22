import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

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
            name: "reports unknownTag and auto-fixes @return to @returns",
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
            name: "reports unknownTag for a completely unknown tag with no fix",
            output: null,
        },
        {
            code: [
                "/**",
                " * See {@notARealInlineTag Unsupported inline tag}.",
                " */",
                "export type Value = string;",
            ].join("\n"),
            errors: [{ messageId: "unknownTag" }],
            name: "reports unknownTag for unknown inline tags written with brace syntax",
            output: null,
        },
        // AdditionalTags option: unlisted tags are still reported even when additionalTags is set
        {
            code: [
                "/**",
                " * @myCustomTag Allowed tag.",
                " * @stillUnknown Still reported.",
                " */",
                "export function run(): void {}",
            ].join("\n"),
            errors: [{ messageId: "unknownTag" }],
            name: "reports unknownTag for tags not in the additionalTags allowlist",
            options: [{ additionalTags: ["myCustomTag"] }],
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
            name: "is valid when all tags are standard TypeDoc tags",
        },
        {
            code: [
                "/**",
                " * @public",
                " * @summary Create a widget.",
                " * @deprecated Use {@link ModernWidget} instead.",
                " */",
                "export function createWidget(): void {}",
            ].join("\n"),
            name: "is valid when using standard modifier and summary tags",
        },
        {
            code: [
                "/**",
                " * {@linkcode Widget}",
                " * {@linkplain Widget|widget docs}",
                " */",
                "export type WidgetName = string;",
            ].join("\n"),
            name: "is valid when using inline link tags",
        },
        {
            code: [
                "/**",
                " * Configure linting with `@typescript-eslint/parser`.",
                " */",
                'export const parserName = "@typescript-eslint/parser";',
            ].join("\n"),
            name: "is valid when prose references scoped package names with @ inside backticks",
        },
        {
            code: [
                "/**",
                " * Example setup:",
                " * ```ts",
                ' * const parser = "@typescript-eslint/parser";',
                " * ```",
                " */",
                'export const parserName = "@typescript-eslint/parser";',
            ].join("\n"),
            name: "is valid when fenced code blocks include @-prefixed strings",
        },
        {
            code: [
                "/**",
                " * @typedef {string | number} Scalar",
                " */",
                "export type Scalar = string | number;",
            ].join("\n"),
            name: "is valid when @typedef modifier tag is used",
        },
        // AdditionalTags option: custom tags should not be reported
        {
            code: [
                "/**",
                " * @myCustomTag Some custom tag.",
                " */",
                "export function run(): void {}",
            ].join("\n"),
            name: "is valid when additionalTags allowlist includes the custom tag",
            options: [{ additionalTags: ["myCustomTag"] }],
        },
        // AdditionalTags option: multiple custom tags allowed simultaneously
        {
            code: [
                "/**",
                " * @pluginTagA First custom tag.",
                " * @pluginTagB Second custom tag.",
                " */",
                "export function run(): void {}",
            ].join("\n"),
            name: "is valid when additionalTags allowlist includes multiple custom tags simultaneously",
            options: [{ additionalTags: ["pluginTagA", "pluginTagB"] }],
        },
    ],
});
