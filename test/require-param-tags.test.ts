import { getPluginRule, createRuleTester } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("require-param-tags", getPluginRule("require-param-tags"), {
    invalid: [
        {
            code: [
                "/**",
                " * Add two numbers.",
                " * @param left First value.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
            errors: [{ messageId: "missingParamTags" }],
            output: [
                "/**",
                " * Add two numbers.",
                " * @param left First value.",
                " * @param right TODO describe right.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
        },
    ],
    valid: [
        {
            code: [
                "/**",
                " * Add two numbers.",
                " * @param left First value.",
                " * @param right Second value.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
        },
    ],
});
