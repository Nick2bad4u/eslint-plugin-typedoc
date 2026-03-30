import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-code-fence-language",
    getPluginRule("require-code-fence-language"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Render value.",
                    " * @example",
                    " * ```",
                    " * renderValue(1);",
                    " * ```",
                    " */",
                    "export function renderValue(value: number): string {",
                    "    return String(value);",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingFenceLanguage" }],
                output: [
                    "/**",
                    " * Render value.",
                    " * @example",
                    " * ```ts",
                    " * renderValue(1);",
                    " * ```",
                    " */",
                    "export function renderValue(value: number): string {",
                    "    return String(value);",
                    "}",
                ].join("\n"),
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Render value.",
                    " * @example",
                    " * ```ts",
                    " * renderValue(1);",
                    " * ```",
                    " */",
                    "export function renderValue(value: number): string {",
                    "    return String(value);",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
