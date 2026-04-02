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
        },
        {
            code: [
                "/**",
                " * {@linkcode Widget}",
                " * {@linkplain Widget|widget docs}",
                " */",
                "export type WidgetName = string;",
            ].join("\n"),
        },
        {
            code: [
                "/**",
                " * @typedef {string | number} Scalar",
                " */",
                "export type Scalar = string | number;",
            ].join("\n"),
        },
        // AdditionalTags option: custom tags should not be reported
        {
            code: [
                "/**",
                " * @myCustomTag Some custom tag.",
                " */",
                "export function run(): void {}",
            ].join("\n"),
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
            options: [{ additionalTags: ["pluginTagA", "pluginTagB"] }],
        },
    ],
});
