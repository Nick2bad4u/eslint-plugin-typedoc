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
                '    return "key:" + id;',
                "}",
            ].join("\n"),
            errors: [
                {
                    messageId: "missingReturnsTag",
                    suggestions: [
                        {
                            messageId: "addReturnsTagSuggestion",
                            output: [
                                "/**",
                                " * Build a cache key.",
                                " * @returns",
                                " */",
                                "export function toCacheKey(id: string): string {",
                                '    return "key:" + id;',
                                "}",
                            ].join("\n"),
                        },
                    ],
                },
            ],
            name: "reports missingReturnsTag and suggests adding bare @returns",
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
                '    return "key:" + id;',
                "}",
            ].join("\n"),
            name: "is valid when non-void function has a @returns tag with description",
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
            name: "is valid for void function without @returns tag",
        },
        {
            code: [
                "/**",
                " * Build a cache key.",
                " */",
                "export function toCacheKey(id: string): string {",
                '    return "key:" + id;',
                "}",
            ].join("\n"),
            filename: "test/require-returns-tag.ts",
            name: "is valid by default in test/ paths",
        },
        {
            code: [
                "/**",
                " * Build a cache key.",
                " */",
                "export declare function toCacheKey(id: string): string;",
            ].join("\n"),
            filename: "types/public-api.d.ts",
            name: "is valid when declaration files are ignored via option",
            options: [{ ignoreDeclarationFiles: true }],
        },
    ],
});
