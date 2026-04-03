import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("require-returns-tag", getPluginRule("require-returns-tag"), {
    invalid: [
        {
            name: "reports missingReturnsTag and auto-adds TODO @returns for a non-void function without one",
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
            name: "is valid when non-void function has a @returns tag with description",
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
            name: "is valid for void function without @returns tag",
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
