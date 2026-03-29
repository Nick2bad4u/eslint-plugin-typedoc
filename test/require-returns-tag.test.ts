import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("require-returns-tag", getPluginRule("require-returns-tag"), {
    invalid: [
        {
            code: [
                "/**",
                " * Build a cache key.",
                " */",
                "export function toCacheKey(id: string): string {",
                "    return `key:${id}`;",
                "}",
            ].join("\n"),
            errors: [{ messageId: "missingReturnsTag" }],
            output: [
                "/**",
                " * Build a cache key.",
                " * @returns TODO describe the return value.",
                " */",
                "export function toCacheKey(id: string): string {",
                "    return `key:${id}`;",
                "}",
            ].join("\n"),
        },
    ],
    valid: [
        {
            code: [
                "/**",
                " * Build a cache key.",
                " * @returns Stable cache key.",
                " */",
                "export function toCacheKey(id: string): string {",
                "    return `key:${id}`;",
                "}",
            ].join("\n"),
        },
        {
            code: [
                "/**",
                " * Log an action.",
                " */",
                "export function logAction(action: string): void {",
                "    console.info(action);",
                "}",
            ].join("\n"),
        },
    ],
});
