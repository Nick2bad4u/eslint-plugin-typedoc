import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-empty-example-tag", getPluginRule("no-empty-example-tag"), {
    invalid: [
        {
            name: "reports emptyExampleTag when @example tag has no content",
            code: [
                "/**",
                " * Add two values.",
                " * @example",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
            errors: [{ messageId: "emptyExampleTag" }],
        },
        {
            name: "reports emptyExampleTag when @example tag contains only an empty code fence",
            code: [
                "/**",
                " * Add two values.",
                " * @example",
                " * ```ts",
                " * ```",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
            errors: [{ messageId: "emptyExampleTag" }],
        },
    ],
    valid: [
        {
            name: "is valid when @example tag contains a non-empty code snippet",
            code: [
                "/**",
                " * Add two values.",
                " * @example",
                " * add(1, 2);",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
        },
    ],
});
