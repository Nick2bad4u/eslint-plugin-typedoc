import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-unknown-tags", getPluginRule("no-unknown-tags"), {
    invalid: [
        {
            name: "reports unknownTag and auto-fixes @return to @returns",
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
            name: "reports unknownTag for a completely unknown tag with no fix",
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
            name: "reports unknownTag for tags not in the additionalTags allowlist",
            code: [
                "/**",
                " * @myCustomTag Allowed tag.",
                " * @stillUnknown Still reported.",
                " */",
                "export function run(): void {}",
            ].join("\n"),
            options: [{ additionalTags: ["myCustomTag"] }],
            errors: [{ messageId: "unknownTag" }],
            output: null,
        },
    ],
    valid: [
        {
            name: "is valid when all tags are standard TypeDoc tags",
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
            name: "is valid when using standard modifier and summary tags",
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
            name: "is valid when using inline link tags",
            code: [
                "/**",
                " * {@linkcode Widget}",
                " * {@linkplain Widget|widget docs}",
                " */",
                "export type WidgetName = string;",
            ].join("\n"),
        },
        {
            name: "is valid when @typedef modifier tag is used",
            code: [
                "/**",
                " * @typedef {string | number} Scalar",
                " */",
                "export type Scalar = string | number;",
            ].join("\n"),
        },
        // AdditionalTags option: custom tags should not be reported
        {
            name: "is valid when additionalTags allowlist includes the custom tag",
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
            name: "is valid when additionalTags allowlist includes multiple custom tags simultaneously",
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
