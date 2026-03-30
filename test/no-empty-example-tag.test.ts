import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-empty-example-tag", getPluginRule("no-empty-example-tag"), {
    invalid: [
        {
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
